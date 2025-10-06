import React, { useState, useEffect } from 'react';
import { Gift, Users, Heart, Plus, Calendar, Star, ArrowLeft, ExternalLink, Clock, Copy, Check, DollarSign, Mail, Lock, Image } from 'lucide-react';
import Papa from 'papaparse';

let currentUser = null;

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [page, setPage] = useState('login');
  const [groups, setGroups] = useState([]);
  const [items, setItems] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(false);

  async function login(user) {
    currentUser = user;
    setIsAuthenticated(true);
    setLoading(true);
    await loadData();
    setLoading(false);
    setPage('dashboard');
  }

  function logout() {
    currentUser = null;
    setIsAuthenticated(false);
    setPage('login');
  }

  async function loadData() {
    try {
      const files = await window.fs.readdir('/');
      const gFile = files.find(f => f.includes('Group_export'));
      const mFile = files.find(f => f.includes('GroupMembership_export'));
      const wFile = files.find(f => f.includes('WishlistItem_export'));

      if (gFile && mFile && wFile) {
        const gData = await window.fs.readFile(gFile, { encoding: 'utf8' });
        const mData = await window.fs.readFile(mFile, { encoding: 'utf8' });
        const wData = await window.fs.readFile(wFile, { encoding: 'utf8' });

        const g = Papa.parse(gData, { header: true, skipEmptyLines: true });
        const m = Papa.parse(mData, { header: true, skipEmptyLines: true });
        const w = Papa.parse(wData, { header: true, skipEmptyLines: true });

        setGroups(g.data);
        setMembers(m.data);
        setItems(w.data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  function nav(newPage, data) {
    setPage(newPage);
    if (data) setSelectedGroup(data);
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (page === 'dashboard') {
    return <Dashboard nav={nav} groups={groups} items={items} members={members} logout={logout} />;
  }
  if (page === 'groups') {
    return <Groups nav={nav} groups={groups} setGroups={setGroups} members={members} logout={logout} />;
  }
  if (page === 'wishlist') {
    return <Wishlist nav={nav} items={items} setItems={setItems} logout={logout} />;
  }
  if (page === 'detail') {
    return <Detail nav={nav} group={selectedGroup} items={items} members={members} logout={logout} />;
  }

  return <Dashboard nav={nav} groups={groups} items={items} members={members} logout={logout} />;
}

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // REPLACE THIS WITH YOUR ACTUAL GOOGLE CLIENT ID
  const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

  function handleLogin(e) {
    e.preventDefault();
    if (email && password) {
      const name = email.split('@')[0];
      onLogin({ email, full_name: name, auth_method: 'email' });
    }
  }

  function handleGoogleLogin() {
    // FOR DEMO: Simulated Google Login
    // Remove this section when implementing real OAuth
    const mockGoogleUser = {
      email: 'user@gmail.com',
      full_name: 'Google User',
      auth_method: 'google',
      picture: 'https://via.placeholder.com/150'
    };
    
    alert('Google Sign-In simulated!\n\nTo enable real Google authentication:\n\n1. Get OAuth Client ID from Google Cloud Console\n2. Replace GOOGLE_CLIENT_ID in code\n3. Load Google Identity Services script\n4. Use google.accounts.id.initialize()\n\nFor demo, logging you in as: ' + mockGoogleUser.email);
    onLogin(mockGoogleUser);

    /* 
    // REAL GOOGLE OAUTH IMPLEMENTATION:
    // Uncomment this code and remove the mock login above
    
    // Method 1: Using Google Identity Services (Recommended)
    if (window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse
      });
      
      window.google.accounts.id.prompt(); // Show One Tap
      // Or use: window.google.accounts.id.renderButton(element, options);
    } else {
      console.error('Google Identity Services not loaded');
    }

    // Method 2: Using OAuth 2.0 redirect flow
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(window.location.origin + '/auth/google/callback')}&` +
      `response_type=code&` +
      `scope=email profile&` +
      `access_type=offline`;
    
    window.location.href = authUrl;
    */
  }

  function handleGoogleResponse(response) {
    // This function handles the response from Google
    // The response contains a JWT credential
    try {
      // Decode the JWT to get user info
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      const googleUser = {
        email: payload.email,
        full_name: payload.name,
        picture: payload.picture,
        auth_method: 'google'
      };
      
      onLogin(googleUser);
    } catch (error) {
      console.error('Error parsing Google response:', error);
    }
  }

  // Load Google Identity Services script
  useEffect(() => {
    // Only load in production with real CLIENT_ID
    if (GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-full mb-4">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Gift Exchange</h1>
          <p className="text-gray-600">Manage wishlists and Secret Santa</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Sign In</h2>

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-3 hover:shadow-md mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or sign in with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter password"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
                />
              </div>
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-lg"
            >
              Sign In
            </button>

            <div className="text-center">
              <button
                type="button"
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Forgot password?
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 font-medium mb-2">📧 Demo Users:</p>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• grokmike@gmail.com</li>
            <li>• stacin@gmail.com</li>
            <li>• jofrnass@gmail.com</li>
          </ul>
          <p className="text-xs text-blue-600 mt-2">Any password works for email login</p>
        </div>

        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800 font-medium mb-2">⚙️ Setup Required for Google OAuth:</p>
          <ol className="text-xs text-amber-700 space-y-1 list-decimal list-inside">
            <li>Get Client ID from Google Cloud Console</li>
            <li>Replace GOOGLE_CLIENT_ID in code</li>
            <li>Uncomment real OAuth implementation</li>
            <li>Deploy to production domain</li>
          </ol>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

function Dashboard({ nav, groups, items, members, logout }) {
  const myMembers = members.filter(m => m.user_email === currentUser.email);
  const myGroupIds = myMembers.map(m => m.group_id);
  const myGroups = groups.filter(g => myGroupIds.includes(g.id));
  const myItems = items.filter(i => i.created_by === currentUser.email);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome, {currentUser.full_name}! 🎁
            </h1>
            <p className="text-gray-600">Manage your wishlists and groups</p>
          </div>
          <div className="flex gap-3">
            <button onClick={logout} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Sign Out
            </button>
            <button onClick={() => nav('wishlist')} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
              <Plus className="w-4 h-4 inline mr-2" />
              Add Item
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div onClick={() => nav('wishlist')} className="bg-white p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">My Wishlist Items</p>
                <p className="text-3xl font-bold">{myItems.length}</p>
              </div>
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </div>

          <div onClick={() => nav('groups')} className="bg-white p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">My Groups</p>
                <p className="text-3xl font-bold">{myGroups.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Items Claimed</p>
                <p className="text-3xl font-bold">0</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Gift className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Recent Items</h2>
            </div>
            <div className="p-6">
              {myItems.slice(0, 3).map(item => (
                <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-lg mb-3">
                  {item.picture_url && (
                    <img src={item.picture_url} alt={item.name} className="w-12 h-12 rounded object-cover" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-sm text-gray-500 truncate">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">My Groups</h2>
            </div>
            <div className="p-6">
              {myGroups.slice(0, 3).map(group => (
                <div key={group.id} onClick={() => nav('detail', group)} className="p-4 bg-emerald-50 rounded-lg mb-3 cursor-pointer hover:bg-emerald-100">
                  <h4 className="font-semibold">{group.name}</h4>
                  <p className="text-sm text-gray-600">{group.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Groups({ nav, groups, setGroups, members, logout }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [copied, setCopied] = useState(null);

  const myMembers = members.filter(m => m.user_email === currentUser.email);
  const myGroupIds = myMembers.map(m => m.group_id);
  const myGroups = groups.filter(g => myGroupIds.includes(g.id));

  function create() {
    const newGroup = {
      id: Date.now().toString(),
      name,
      description: desc,
      invite_code: Math.random().toString(36).substr(2, 6).toUpperCase(),
      created_by: currentUser.email
    };
    setGroups([...groups, newGroup]);
    setName('');
    setDesc('');
    setShowForm(false);
  }

  function copy(code) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">My Groups 👥</h1>
          <div className="flex gap-3">
            <button onClick={() => nav('dashboard')} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              <ArrowLeft className="w-4 h-4 inline mr-2" />
              Back
            </button>
            <button onClick={logout} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Sign Out</button>
            <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg">
              <Plus className="w-4 h-4 inline mr-2" />
              Create
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Create Group</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Group name"
                className="w-full border rounded-lg px-3 py-2"
              />
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Description"
                className="w-full border rounded-lg px-3 py-2"
                rows="3"
              />
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button onClick={create} className="px-4 py-2 bg-emerald-600 text-white rounded-lg">Create</button>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myGroups.map(group => {
            const groupMembers = members.filter(m => m.group_id === group.id);
            return (
              <div key={group.id} className="bg-white rounded-lg shadow-lg p-6">
                <h3 onClick={() => nav('detail', group)} className="text-xl font-bold mb-2 cursor-pointer hover:text-emerald-600">
                  {group.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{group.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <Users className="w-4 h-4" />
                  {groupMembers.length} members
                </div>
                <div className="border-t pt-4">
                  <p className="text-xs text-gray-500 mb-2">Invite Code:</p>
                  <div className="flex gap-2">
                    <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm">{group.invite_code}</code>
                    <button onClick={() => copy(group.invite_code)} className="p-2 hover:bg-gray-100 rounded">
                      {copied === group.invite_code ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Wishlist({ nav, items, setItems, logout }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [url, setUrl] = useState('');
  const [pic, setPic] = useState('');
  const [price, setPrice] = useState('$25-$50');
  const [priority, setPriority] = useState('medium');

  const myItems = items.filter(i => i.created_by === currentUser.email);

  function add() {
    const newItem = {
      id: Date.now().toString(),
      name,
      description: desc,
      url,
      picture_url: pic,
      price_range: price,
      priority,
      claimed_status: 'available',
      created_by: currentUser.email
    };
    setItems([...items, newItem]);
    setName('');
    setDesc('');
    setUrl('');
    setPic('');
    setShowForm(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">My Wishlist ❤️</h1>
          <div className="flex gap-3">
            <button onClick={() => nav('dashboard')} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              <ArrowLeft className="w-4 h-4 inline mr-2" />
              Back
            </button>
            <button onClick={logout} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Sign Out</button>
            <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg">
              <Plus className="w-4 h-4 inline mr-2" />
              Add
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Add Item</h2>
            <div className="space-y-4">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Item name" className="w-full border rounded-lg px-3 py-2" />
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" className="w-full border rounded-lg px-3 py-2" rows="3" />
              <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Product URL" className="w-full border rounded-lg px-3 py-2" />
              <input type="url" value={pic} onChange={(e) => setPic(e.target.value)} placeholder="Picture URL" className="w-full border rounded-lg px-3 py-2" />
              <div className="grid grid-cols-2 gap-4">
                <select value={price} onChange={(e) => setPrice(e.target.value)} className="border rounded-lg px-3 py-2">
                  <option>Under $25</option>
                  <option>$25-$50</option>
                  <option>$50-$100</option>
                  <option>$100-$200</option>
                  <option>Over $200</option>
                </select>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="border rounded-lg px-3 py-2">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button onClick={add} className="px-4 py-2 bg-emerald-600 text-white rounded-lg">Add</button>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myItems.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="aspect-square bg-gray-100">
                {item.picture_url ? (
                  <img src={item.picture_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="w-16 h-16 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2">{item.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                <div className="flex gap-2 mb-4">
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded">{item.price_range}</span>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">{item.priority}</span>
                </div>
                {item.url && (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 text-sm flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    View Product
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Detail({ nav, group, items, members, logout }) {
  const [tab, setTab] = useState('members');
  const groupMembers = members.filter(m => m.group_id === group.id);
  const memberEmails = groupMembers.map(m => m.user_email);
  const groupItems = items.filter(i => memberEmails.includes(i.created_by) && i.created_by !== currentUser.email);

  function getInitials(email) {
    return email.split('@')[0].substring(0, 2).toUpperCase();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => nav('groups')} className="p-2 border rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{group.name}</h1>
            <p className="text-gray-600">{group.description}</p>
          </div>
          <button onClick={logout} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Sign Out</button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Members</p>
                <p className="font-semibold">{groupMembers.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b p-6">
            <div className="flex gap-4">
              <button onClick={() => setTab('members')} className={`px-4 py-2 rounded-lg ${tab === 'members' ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-gray-100'}`}>
                Members
              </button>
              <button onClick={() => setTab('wishlists')} className={`px-4 py-2 rounded-lg ${tab === 'wishlists' ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-gray-100'}`}>
                Wishlists
              </button>
            </div>
          </div>

          <div className="p-6">
            {tab === 'members' && (
              <div className="space-y-4">
                {groupMembers.map((m, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-emerald-700 font-semibold">{getInitials(m.user_email)}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{m.user_email}</p>
                      <p className="text-sm text-gray-500">{m.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'wishlists' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupItems.map(item => (
                  <div key={item.id} className="bg-gray-50 rounded-lg overflow-hidden">
                    <div className="aspect-square bg-gray-200">
                      {item.picture_url ? (
                        <img src={item.picture_url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold mb-1">{item.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <p className="text-xs text-gray-500">By: {item.created_by}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}