package com.api.perpustakaan.dto.pustakawan;

import lombok.Data;

@Data
public class PustakawanRequestDTO {
    private String name;
    private String username;
    private String password;
    private String email;
    private String nip;
}
