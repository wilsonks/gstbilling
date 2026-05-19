package com.wilsonks.gstbilling.auth.token;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "refresh_token")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RefreshToken {

    @Id
    @GeneratedValue
    private Long id;

    private Long userId;
    private String token;
    private Long companyId;

    private LocalDateTime expiry;
    private boolean revoked;

}

