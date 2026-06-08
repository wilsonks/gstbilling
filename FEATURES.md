# Application Features

<!-- TOC -->
* [Authentication](#authentication)
* [Authorization](#authorization)
* [User Management](#user-management)
<!-- TOC -->


## User Management

- [x] User Registration
- [ ] User Login
- [ ] Password Reset
- [ ] First Login Password Change
- [ ] User Roles and Permissions
- [ ] User Profile Management

### Password Reset

- [ ] Email-based Password Reset
- [ ] Security Questions for Password Reset
- [ ] Password Strength Validation
- [ ] Password Expiration Policy
- [ ] Password History to Prevent Reuse
- [ ] CAPTCHA Integration for Password Reset Requests

### First Login Password Change

```html
Import User
↓
Temp Password Assigned
↓
forcePasswordChange = true
↓
Login
↓
Redirect to Change Password Screen
↓
Password Updated
↓
forcePasswordChange = false

```

* Phase 1 — User Entity Enhancement 
  * add a field to indicate if the user must change their password on first login (e.g., `forcePasswordChange` boolean field).
* Phase 2 — Create User through Import - forcePasswordChange = true
  * make this field true and assign a temporary password.
* Phase 3 — DTO Enhancement - TenantUserDto
  * include the `forcePasswordChange` field in the DTO to ensure it is properly handled during user creation and updates.
Phase 4 — Login Response Enhancement - LoginResponseDto
  * include the `forcePasswordChange` field in the login response to inform the frontend whether the user needs to change their password.
Phase 5 — Frontend Login Flow
  * if(response.forcePasswordChange){ navigate("/change-password"); return; }
  * JWT filter or controller advice should enforce:if user is authenticated and `forcePasswordChange` is true, redirect to the change password screen instead of allowing access to other parts of the application.
* Phase 6 — Change Password Backend
  * Dto: Create Change Password request Dto
  * Controller: Implement an endpoint to handle password change requests, which will validate the new password and update the user's password in the database.
  * Service: Implement the logic to update the user's password and set `forcePasswordChange` to false after a successful password change.
* Phase 6 — Change Password Screen
  * create a frontend screen for users to change their password, which will be displayed when `forcePasswordChange` is true after login.
Phase 10 — Admin Reset Password
