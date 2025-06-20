package com.api.perpustakaan.dto.pustakawan;

import com.api.perpustakaan.constant.RoleConstant;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PustakawanResponseDTO {
    private Integer id;
    private String name;
    private String username;
    private String email;
    private String nip;
    private RoleConstant role;
}
