package com.bodega.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.sql.DataSource;
import java.io.IOException;
import java.sql.Connection;
import java.sql.Statement;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuditFilter extends OncePerRequestFilter {

    private final DataSource dataSource;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()
                    && auth.getDetails() instanceof Long idUsuario) {
                AuditContext.setUsuarioId(idUsuario);
                injectarUsuarioEnBD(idUsuario);
            }
            filterChain.doFilter(request, response);
        } finally {
            AuditContext.limpiar();
        }
    }

    private void injectarUsuarioEnBD(Long idUsuario) {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            conn.setAutoCommit(false);
            stmt.execute("SET LOCAL app.usuario_id = " + idUsuario);
            conn.commit();
        } catch (Exception e) {
            log.warn("No se pudo inyectar app.usuario_id en la sesión de BD", e);
        }
    }
}
