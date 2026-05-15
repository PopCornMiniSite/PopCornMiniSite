import asyncio
from telethon import TelegramClient

async def main():
    c = TelegramClient("sessions/user", 32360090, "c7b022dcf0b1d3021197857e51be9375")
    await c.connect()
    if not await c.is_user_authorized():
        await c.send_code_request("+213549160496")
        code = "75255"
        await c.sign_in("+213549160496", code)
    me = await c.get_me()
    print(f"✅ Logged in as {me.first_name} (ID: {me.id})")
    await c.disconnect()
    print("✅ Session saved")

asyncio.run(main())
