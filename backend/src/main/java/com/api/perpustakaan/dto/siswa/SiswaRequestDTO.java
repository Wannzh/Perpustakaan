package com.api.perpustakaan.dto.siswa;

import lombok.Data;

@Data
public class SiswaRequestDTO {
    private String name;
    private String username;
    private String password;
    private String email;
    private String nis;
    private String userClass;
}
