// Script de test simple pour valider l'API
import { environment } from './environments/environment';

export async function testAPI() {
  const baseUrl = environment.api.baseUrl;

  console.log('🧪 Testing API endpoints...');
  console.log('Base URL:', baseUrl);

  try {
    // Test 1: Stats endpoint
    console.log('\n📊 Testing /api/stats...');
    const statsResponse = await fetch(`${baseUrl}/stats`);
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('✅ Stats OK:', statsData);
    } else {
      console.log('❌ Stats failed:', statsResponse.status);
    }

    // Test 2: Books endpoint
    console.log('\n📚 Testing /api/livres...');
    const booksResponse = await fetch(`${baseUrl}/livres`);
    if (booksResponse.ok) {
      const booksData = await booksResponse.json();
      console.log('✅ Books OK:', booksData);
      console.log('Number of books:', booksData.data?.length || 0);
    } else {
      console.log('❌ Books failed:', booksResponse.status);
    }

    // Test 3: Authors endpoint
    console.log('\n👥 Testing /api/auteurs...');
    const authorsResponse = await fetch(`${baseUrl}/auteurs`);
    if (authorsResponse.ok) {
      const authorsData = await authorsResponse.json();
      console.log('✅ Authors OK:', authorsData);
    } else {
      console.log('❌ Authors failed:', authorsResponse.status);
    }

    // Test 4: Categories endpoint
    console.log('\n🏷️ Testing /api/categories...');
    const categoriesResponse = await fetch(`${baseUrl}/categories`);
    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json();
      console.log('✅ Categories OK:', categoriesData);
    } else {
      console.log('❌ Categories failed:', categoriesResponse.status);
    }

  } catch (error) {
    console.error('🚨 API Test Error:', error);
  }
}

// Auto-run dans la console du navigateur
if (typeof window !== 'undefined') {
  (window as any).testAPI = testAPI;
  console.log('💡 API test function loaded. Run testAPI() in console to test endpoints.');
}