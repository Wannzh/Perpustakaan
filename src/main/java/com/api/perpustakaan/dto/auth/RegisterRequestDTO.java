package com.api.perpustakaan.dto.auth;

import com.api.perpustakaan.constant.RoleConstant;
import lombok.Data;

@Data
public class RegisterRequestDTO {
    private String name;
    private String username;
    private String password;
    private String email;
    private String nip;
    private String nis;
    private String userClass;
    private RoleConstant role;
}