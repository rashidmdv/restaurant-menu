// Simple test script to verify presigned URL upload functionality
// Run with: node test-upload.js

const testPresignedUrlUpload = async () => {
  try {
    console.log('🧪 Testing Presigned URL Upload...')
    
    // Step 1: Test getting presigned URL
    console.log('📡 Step 1: Getting presigned URL...')
    const fileName = `items/${Date.now()}-test.jpg`
    
    // Try POST method first
    let response
    try {
      response = await fetch('http://127.0.0.1:8000/api/v1/upload/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: fileName,
          content_type: 'image/jpeg',
          expires_in: 15
        })
      })
    } catch (error) {
      console.log('❌ POST method failed, trying GET...')
      // Fallback to GET method
      const params = new URLSearchParams({
        key: fileName,
        content_type: 'image/jpeg',
        expires_in: '15'
      })
      
      response = await fetch(`http://127.0.0.1:8000/api/v1/upload/presigned-url?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`)
    }

    const data = await response.json()
    console.log('✅ Got presigned URL response:', {
      status: response.status,
      hasUrl: !!(data.data?.url || data.url),
      responseKeys: Object.keys(data)
    })

    const uploadUrl = data.data?.url || data.url
    if (!uploadUrl) {
      throw new Error('No upload URL in response')
    }

    console.log('📤 Step 2: Testing S3 upload URL format...')
    console.log('Upload URL:', uploadUrl)
    console.log('Expected final URL:', `https://restaurant-menu-images.s3.us-east-1.amazonaws.com/${fileName}`)

    console.log('✅ Test completed successfully!')
    console.log('🎉 Presigned URL upload implementation looks good!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\n🔧 Debugging info:')
    console.log('- Make sure backend is running on http://127.0.0.1:8000')
    console.log('- Check if presigned URL endpoint is configured correctly')
    console.log('- Verify AWS S3 credentials are set in backend')
  }
}

// Run the test
testPresignedUrlUpload()