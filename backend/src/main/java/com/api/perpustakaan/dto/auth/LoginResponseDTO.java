package com.api.perpustakaan.dto.auth;

import java.util.UUID;

import com.api.perpustakaan.constant.RoleConstant;
import lombok.*;

@Data
@Builder
public class LoginResponseDTO {
    private UUID id;
    private String name;
    private String username;
    private String email;
    private String nis;
    private String userClass;
    private RoleConstant role;
    private String token;
}
