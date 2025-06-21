package com.api.perpustakaan.config;

import com.api.perpustakaan.constant.RoleConstant;
import com.api.perpustakaan.exception.CustomAccessDeniedException;
import com.api.perpustakaan.exception.CustomUnAuthorizeException;
import com.api.perpustakaan.security.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SpringSecurity {

    private final JwtFilter jwtFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @SuppressWarnings("removal")
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.cors();
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(new CustomUnAuthorizeException())
                        .accessDeniedHandler(new CustomAccessDeniedException()))
                .authorizeHttpRequests(auth -> auth
                        // Public
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/swagger-resources/**",
                                "/configuration/ui",
                                "/configuration/security",
                                "/webjars/**",
                                "/api-docs/**",
                                "/api-docs/swagger-config",
                                "/api/auth/login")
                        .permitAll()

                        // KEPALA only
                        .requestMatchers(
                                "/api/users/**",
                                "/api/admin/**",
                                "/api/books/**",
                                "/api/reports/**")
                        .hasAuthority(RoleConstant.KEPALA.name())

                        // PUSTAKAWAN only
                        .requestMatchers(
                                "/api/pustakawan/**",
                                "/api/peminjaman/manual/**",
                                "/api/pengembalian/manual/**")
                        .hasAuthority(RoleConstant.PUSTAKAWAN.name())

                        // SISWA only
                        .requestMatchers(
                                "/api/peminjaman/self/**",
                                "/api/pengembalian/self/**",
                                "/api/notifications/**")
                        .hasAuthority(RoleConstant.SISWA.name())

                        // All authenticated
                        .anyRequest().authenticated())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}