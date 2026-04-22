# Pharmacy Management System - Quick Start Guide

## ✅ BACKEND IS NOW RUNNING!

The backend server is currently running in a separate window titled:
"C:\Windows\system32\cmd.exe - mvnw.cmd spring-boot:run"

**DO NOT CLOSE THIS WINDOW** - it's your backend server!

---

## How to Use the Application

### 1. Access the Application
- Open your browser and go to: **http://localhost:3000**

### 2. Login Credentials
- **Admin Account:**
  - Username: `admin`
  - Password: `admin123`
  - (Can add, edit, delete medicines and process sales)

- **Pharmacist Account:**
  - Username: `test`
  - Password: `test123`
  - (Can add, edit medicines and process sales, but cannot delete)

### 3. Features Available
1. **Inventory Management** - Add, edit, search medicines with expiry tracking
2. **Point of Sale (POS)** - Process sales with cart system
3. **Profile** - View user info and logout

---

## Troubleshooting

### If you see "ERR_CONNECTION_REFUSED" error:

**The backend is not running.** To start it:

1. Open Command Prompt or PowerShell
2. Navigate to: `C:\Users\Acer\Downloads\PMS`
3. Run: `mvnw.cmd spring-boot:run`
4. Wait 30 seconds for it to start
5. Look for the message: "Started PmsApplication in X seconds"
6. Keep this window open while using the app

**OR** simply double-click: `C:\Users\Acer\Downloads\PMS\start-backend.bat`

### If you see "401 Unauthorized" errors after login:

This should now be FIXED with the session management updates. The login will:
1. Authenticate your credentials
2. Create a secure HTTP session
3. Store your authentication in the session
4. Send a session cookie (JSESSIONID) to your browser
5. All subsequent requests will use this cookie automatically

**If you still see 401 errors:**
1. Clear your browser cookies for localhost
2. Refresh the page (Ctrl+F5)
3. Login again

---

## Starting the System (After Reboot)

**Every time you restart your computer, you need to start the backend:**

1. Double-click `start-backend.bat` in `C:\Users\Acer\Downloads\PMS`
   OR
   Open terminal and run: `cd C:\Users\Acer\Downloads\PMS ; mvnw.cmd spring-boot:run`

2. Wait for "Started PmsApplication" message (about 30 seconds)

3. Open browser to http://localhost:3000

4. Login and use the application

---

## Technical Details

- **Backend:** Spring Boot running on port 8080
- **Frontend:** React running on port 3000
- **Database:** MySQL (pharmacy_db)
- **Authentication:** Session-based with HTTP cookies
- **Security:** Spring Security with BCrypt password encoding

---

## Support

If you encounter any issues:
1. Check that the backend window is still open and running
2. Check that MySQL is running
3. Try restarting the backend
4. Clear browser cache and cookies
5. Check the backend window for error messages

