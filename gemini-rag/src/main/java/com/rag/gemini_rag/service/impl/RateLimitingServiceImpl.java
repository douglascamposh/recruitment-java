package com.rag.gemini_rag.service.impl;

import com.rag.gemini_rag.service.IRateLimitingService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitingServiceImpl implements IRateLimitingService {

    private static final int MAX_REQUESTS_PER_DAY = 3;

    // Mapa en memoria: Guarda la IP y su respectivo contador
    private final Map<String, RateLimitTracker> ipCache = new ConcurrentHashMap<>();

    public boolean allowRequest(String ip) {
        LocalDate today = LocalDate.now();

        // Obtenemos el registro de la IP, o creamos uno nuevo si no existe
        RateLimitTracker tracker = ipCache.computeIfAbsent(ip, k -> new RateLimitTracker(today));

        // Sincronizamos solo el objeto específico de esta IP para evitar problemas de concurrencia
        synchronized (tracker) {
            // Si el registro es de ayer o antes, reiniciamos el contador y la fecha a hoy
            if (!tracker.date.equals(today)) {
                tracker.date = today;
                tracker.count = 0;
            }

            // Verificamos si ya alcanzó el límite
            if (tracker.count >= MAX_REQUESTS_PER_DAY) {
                return false; // Bloqueado
            }

            // Incrementamos el uso y permitimos la petición
            tracker.count++;
            return true; // Permitido
        }
    }

    // Clase interna para llevar el control
    private static class RateLimitTracker {
        LocalDate date;
        int count;

        RateLimitTracker(LocalDate date) {
            this.date = date;
            this.count = 0;
        }
    }
}