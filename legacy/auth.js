/* ============================================================
   NailBook shared authentication
   ============================================================ */

function showAuthMessage(element, text, type = 'error') {
  if (!element) return;
  element.textContent = text || '';
  element.style.color = type === 'success' ? '#199b4b' : '#e63863';
}

function safeText(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function initials(name) {
  return String(name || 'N')
    .trim()
    .split(/\s+/)
    .map(x => x[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'N';
}

async function getSignedInUser() {
  const { data, error } = await supabaseClient.auth.getUser();
  if (error || !data?.user) return null;
  return data.user;
}

async function getProfile(userId) {
  const { data, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function provisionProfile(options = {}) {
  const {
    role = null,
    fullName = null,
    phone = null,
    city = null,
    location = null,
    businessName = null,
    services = null
  } = options;

  const { data, error } = await supabaseClient.rpc('ensure_nailbook_profile', {
    p_role: role,
    p_full_name: fullName,
    p_phone: phone,
    p_city: city,
    p_location: location,
    p_business_name: businessName,
    p_services: services
  });

  if (error) throw error;
  return data;
}

async function signUpNailBookUser({
  role,
  email,
  password,
  fullName,
  phone = '',
  city = '',
  location = '',
  businessName = '',
  services = []
}) {
  if (!['artist', 'client'].includes(role)) {
    throw new Error('Please choose Artist or Client account type.');
  }

  const metadata = {
    role,
    full_name: fullName,
    phone,
    city,
    location,
    business_name: businessName || fullName,
    services
  };

  // Supabase only creates an immediate session when email confirmation is disabled.
  // When confirmation is enabled, the confirmation link returns the user to the
  // correct dashboard after the email has been verified.
  const emailRedirectTo = window.location.protocol.startsWith('http')
    ? new URL(role === 'artist' ? 'DashboardArtist.html' : 'dashboardclient.html', window.location.href).href
    : undefined;

  const { data, error } = await supabaseClient.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: metadata,
      ...(emailRedirectTo ? { emailRedirectTo } : {})
    }
  });

  if (error) {
    throw normalizeAuthError(error);
  }

  // If email confirmation is OFF, the session exists immediately and we can
  // create the public NailBook profile immediately.
  if (data.session && data.user) {
    // Immediately provision the profile using the role selected on this page.
    // Do not silently continue if this fails: otherwise the dashboard may see
    // an incomplete/wrong profile and redirect to the wrong login page.
    await provisionProfile({
      role,
      fullName,
      phone,
      city,
      location,
      businessName: businessName || fullName,
      services
    });

    // Verify the role before returning control to the signup page.
    const createdProfile = await getProfile(data.user.id);
    if (!createdProfile) {
      throw new Error('The Supabase account was created, but the NailBook profile could not be created. Run the latest nailbook.sql.');
    }

    if (createdProfile.role !== role) {
      await supabaseClient.auth.signOut();
      throw new Error(
        role === 'artist'
          ? 'This email is already associated with a client profile. Please use a different email for the artist account.'
          : 'This email is already associated with an artist profile. Please use a different email for the client account.'
      );
    }
  }

  return data;
}

async function signInNailBookUser({ email, password, expectedRole }) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password
  });

  if (error) throw normalizeAuthError(error);

  // Make sure Supabase has actually persisted the authenticated session
  // before the browser is redirected to the dashboard.
  const { data: sessionData, error: sessionError } =
    await supabaseClient.auth.getSession();

  if (sessionError || !sessionData?.session?.user) {
    throw new Error(
      'Login succeeded, but Supabase did not keep the login session. Please check that browser storage/cookies are enabled and try again.'
    );
  }

  const user = sessionData.session.user;
  const profile = await getProfile(user.id);

  // A profile should already exist after signup. Only provision one if it is
  // genuinely missing. This prevents a login from accidentally applying a
  // default role to an existing account.
  let finalProfile = profile;

  if (!finalProfile) {
    await provisionProfile({
      role: expectedRole || null
    });
    finalProfile = await getProfile(user.id);
  }

  if (!finalProfile) {
    await supabaseClient.auth.signOut();
    throw new Error(
      'Login succeeded, but your NailBook profile was not found. Run the latest nailbook.sql in Supabase.'
    );
  }

  if (expectedRole && finalProfile.role !== expectedRole) {
    await supabaseClient.auth.signOut();
    throw new Error(
      expectedRole === 'artist'
        ? `This account is registered as a ${finalProfile.role || 'different'} account, not an artist account. Use an artist email that has an artist profile.`
        : `This account is registered as a ${finalProfile.role || 'different'} account, not a client account.`
    );
  }

  return {
    user,
    session: sessionData.session,
    profile: finalProfile
  };
}

async function requireLogin(expectedRole) {
  const { data: sessionData, error: sessionError } =
    await supabaseClient.auth.getSession();

  if (sessionError || !sessionData?.session?.user) {
    window.location.href = expectedRole === 'artist'
      ? 'loginArtist.html'
      : 'loginclient.html';
    return null;
  }

  const user = sessionData.session.user;

  try {
    // First read the existing profile. Do NOT call the provisioning RPC for
    // every dashboard load because that can mask the real role/session state.
    let profile = await getProfile(user.id);

    if (!profile) {
      await provisionProfile({ role: expectedRole || null });
      profile = await getProfile(user.id);
    }

    if (!profile) {
      throw new Error('No NailBook profile exists for this account.');
    }

    if (expectedRole && profile.role !== expectedRole) {
      await supabaseClient.auth.signOut();
      window.location.href = expectedRole === 'artist'
        ? 'loginArtist.html'
        : 'loginclient.html';
      return null;
    }

    return {
      authUser: user,
      profile
    };
  } catch (error) {
    console.error('NailBook profile error:', error);
    alert(
      'NailBook could not load your profile.\n\n' +
      (error.message || String(error))
    );
    return null;
  }
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = 'Home%20page.html';
}

async function logoutClient() {
  return logout();
}

function normalizeAuthError(error) {
  const message = String(error?.message || error || 'Authentication failed.');
  const lower = message.toLowerCase();

  if (lower.includes('database error saving new user')) {
    return new Error(
      'Supabase Auth is still being blocked by a database trigger or Auth Hook. Run the latest nailbook.sql in the NailBook Supabase project, then check the final query for remaining custom auth.users triggers.'
    );
  }

  if (lower.includes('user already registered')) {
    return new Error('An account with this email already exists. Please log in instead.');
  }

  if (lower.includes('email not confirmed')) {
    return new Error('Please confirm your email address first, then log in.');
  }

  if (lower.includes('invalid login credentials')) {
    return new Error('Incorrect email or password.');
  }

  return error instanceof Error ? error : new Error(message);
}

window.safeText = safeText;
window.initials = initials;
window.getSignedInUser = getSignedInUser;
window.getProfile = getProfile;
window.provisionProfile = provisionProfile;
window.requireLogin = requireLogin;
window.signUpNailBookUser = signUpNailBookUser;
window.signInNailBookUser = signInNailBookUser;
window.logout = logout;
window.logoutClient = logoutClient;
window.showAuthMessage = showAuthMessage;
