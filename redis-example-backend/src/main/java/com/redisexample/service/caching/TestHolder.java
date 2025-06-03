package com.redisexample.service.caching;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.redisexample.model.state.TestState;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TestHolder {

    private static final String TEST_KEY_PREFIX = "test:";

    private final CacheService cacheService;
    private final ObjectMapper objectMapper;

    public void updateTestState(String testName, TestState testState) {
        cacheService.saveToCache(TEST_KEY_PREFIX + testName, testState);
    }

    public TestState getTestState(String testName) {
        return objectMapper.convertValue(
                cacheService.fetchFromCache(TEST_KEY_PREFIX + testName),
                TestState.class);
    }

    public void removeTestState(String testName) {
        cacheService.removeFromCache(TEST_KEY_PREFIX + testName);
    }

    public Map<String, TestState> getAllTestStates() {
        Map<String, TestState> devices = new HashMap<>();
        var entries = cacheService.fetchAll(TEST_KEY_PREFIX + "*");
        for (Object entry : entries) {
            TestState testState =
                    objectMapper.convertValue(entry, TestState.class);
            if (testState != null) {
                devices.put(testState.getTestName(), testState);
            }
        }
        return devices;
    }

}
