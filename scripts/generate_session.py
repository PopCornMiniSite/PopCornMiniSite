import asyncio
import sys
from telethon import TelegramClient
from telethon.errors import SessionPasswordNeededError

API_ID = 38256436
API_HASH = 'fdfd3f13173d6931e24acc63022e504a'
PHONE = '+213697684375'
SESSION_FILE = 'popcorn_session.session'
SESSION_STRING_FILE = 'popcorn_session_string.txt'

async def main():
    client = TelegramClient(SESSION_FILE, API_ID, API_HASH)
    await client.connect()

    if await client.is_user_authorized():
        print('✅ Already authorized. Generating session string...')
    else:
        # Step 1: Send code request
        if len(sys.argv) < 2:
            await client.send_code_request(PHONE)
            print('📱 Verification code sent to', PHONE)
            print('➡️  Now run: python3 generate_session.py <code>')
            print('   Or if you have 2FA: python3 generate_session.py <code> <2fa_password>')
            await client.disconnect()
            return

        code = sys.argv[1]
        password = sys.argv[2] if len(sys.argv) > 2 else None

        try:
            await client.sign_in(phone=PHONE, code=code)
        except SessionPasswordNeededError:
            if password:
                await client.sign_in(password=password)
            else:
                print('❌ 2FA password required')
                print('➡️  Run: python3 generate_session.py <code> <2fa_password>')
                await client.disconnect()
                return

    print('✅ Logged in successfully!')

    session_string = await client.session.save()
    with open(SESSION_STRING_FILE, 'w') as f:
        f.write(session_string)

    print(f'✅ Session string saved to {SESSION_STRING_FILE}')
    print(f'📋 Session string:\n{session_string}')

    await client.disconnect()

if __name__ == '__main__':
    asyncio.run(main())
