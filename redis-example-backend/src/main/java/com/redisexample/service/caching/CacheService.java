package com.redisexample.service.caching;

import java.util.Arrays;
import java.util.List;
import java.util.Set;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CacheService {

    private final RedisTemplate<String, Object> redisTemplate;

    public void saveToCache(String key, Object data) {
        redisTemplate.opsForValue().set(key, data);
    }

    public Object fetchFromCache(String key) {
        return redisTemplate.opsForValue().get(key);
    }

    public void removeFromCache(String key) {
        redisTemplate.delete(key);
    }

    public Set<String> fetchAllKeys(String pattern) {
        return redisTemplate.keys(pattern);
    }

    public List<Object> fetchAll(String pattern) {
        var keys = fetchAllKeys(pattern);
        return redisTemplate.opsForValue().multiGet(keys);
    }

    public Object fetchKeys(String... keys) {
        return redisTemplate.opsForValue().multiGet(Arrays.asList(keys));
    }

    public boolean isExists(String key) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    public void saveToCacheWithSecondaryKey(String primaryKey, String secondaryKey, Object data) {
        redisTemplate.opsForValue().set(primaryKey, data);
        redisTemplate.opsForValue().set(secondaryKey, data);
    }

    public void removeFromCacheWithSecondaryKey(String primaryKey, String secondaryKey) {
        redisTemplate.delete(Arrays.asList(primaryKey, secondaryKey));
    }
}