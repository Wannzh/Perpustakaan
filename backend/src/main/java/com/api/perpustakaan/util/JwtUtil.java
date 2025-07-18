package com.api.perpustakaan.util;

import com.api.perpustakaan.constant.RoleConstant;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.concurrent.TimeUnit;

@Component
public class JwtUtil {

    private final Key SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS512); // ✅ aman & sesuai
    private final long EXPIRATION_MINUTES = 1440L; // 1 hari

    private final String TOKEN_HEADER = "Authorization";
    private final String TOKEN_PREFIX = "Bearer ";

    @SuppressWarnings("deprecation")
    private final JwtParser jwtParser = Jwts.parser().setSigningKey(SECRET_KEY);

    public String generateToken(String username, Integer userId, RoleConstant role) {
        Claims claims = Jwts.claims().setSubject(username);
        claims.put("username", username);   
        claims.put("role", role.name());
        claims.put("userId", userId);

        Date issuedAt = new Date();
        Date expiration = new Date(issuedAt.getTime() + TimeUnit.MINUTES.toMillis(EXPIRATION_MINUTES));

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(issuedAt)
                .setExpiration(expiration)
                .signWith(SECRET_KEY) // tidak perlu tentukan algo lagi karena Key sudah menyimpan itu
                .compact();
    }

    public String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader(TOKEN_HEADER);
        if (bearerToken != null && bearerToken.startsWith(TOKEN_PREFIX)) {
            return bearerToken.substring(TOKEN_PREFIX.length());
        }
        return null;
    }

    public Claims resolveClaims(HttpServletRequest request) {
        try {
            String token = resolveToken(request);
            if (token != null) {
                return jwtParser.parseClaimsJws(token).getBody();
            }
            return null;
        } catch (ExpiredJwtException ex) {
            request.setAttribute("expired", ex.getMessage());
            throw ex;
        } catch (Exception ex) {
            request.setAttribute("invalid", ex.getMessage());
            throw ex;
        }
    }

    public boolean validateClaims(Claims claims) {
        try {
            return claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }
}
