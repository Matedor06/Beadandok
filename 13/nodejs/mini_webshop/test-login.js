const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000/api';

async function testAdminLogin() {
  try {
    const response = await fetch(API_URL + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'admin@webshop.hu', 
        password: 'admin123' 
      })
    });

    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.user) {
      console.log('\n✅ User object:', data.user);
      console.log('Is admin?', data.user.is_admin === 1 ? 'YES' : 'NO');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAdminLogin();
