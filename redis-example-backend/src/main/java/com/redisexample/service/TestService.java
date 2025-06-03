package com.redisexample.service;

import com.redisexample.model.state.TestState;
import com.redisexample.service.caching.TestHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class TestService {

    private final TestHolder testHolder;

    public TestState saveTest(TestState testState) {
        testHolder.updateTestState(
                testState.getTestName(),
                testState
        );
        return testState;
    }

    public TestState getTest(String testName) {
        return testHolder.getTestState(testName);
    }

    public void deleteTest(String testName) {
        testHolder.removeTestState(testName);
    }

    public Map<String, TestState> getAllTests() {
        return testHolder.getAllTestStates();
    }

}
