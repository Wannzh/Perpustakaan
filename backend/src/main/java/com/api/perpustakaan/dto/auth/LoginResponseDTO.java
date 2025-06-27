package com.api.perpustakaan.dto.auth;

import com.api.perpustakaan.constant.RoleConstant;
import lombok.*;

@Data
@Builder
public class LoginResponseDTO {
    private Integer id;
    private String name;
    private String username;
    private String email;
    private String nis;
    private String userClass;
    private RoleConstant role;
    private String token;
}
