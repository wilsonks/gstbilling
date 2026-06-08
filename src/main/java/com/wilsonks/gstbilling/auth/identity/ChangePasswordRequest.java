package com.wilsonks.gstbilling.auth.identity;

import lombok.Data;

@Data
public class ChangePasswordRequest {

    private String currentPassword;

    private String newPassword;

    private String confirmPassword;
}