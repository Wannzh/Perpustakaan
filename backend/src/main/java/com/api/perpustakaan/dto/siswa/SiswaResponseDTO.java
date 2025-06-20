package com.api.perpustakaan.dto.siswa;

import com.api.perpustakaan.constant.RoleConstant;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SiswaResponseDTO {
    private Integer id;
    private String name;
    private String username;
    private String email;
    private String nis;
    private String userClass;
    private RoleConstant role;
}
