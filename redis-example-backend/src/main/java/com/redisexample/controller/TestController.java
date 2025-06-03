package com.redisexample.controller;

import com.redisexample.model.state.TestState;
import com.redisexample.service.TestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/test")
public class TestController {

    private final TestService testService;

    @PostMapping
    public ResponseEntity<TestState> saveTest(@RequestBody TestState testState) {
        return ResponseEntity.status(HttpStatus.CREATED).body(testService.saveTest(testState));
    }

    @GetMapping("/{testName}")
    public ResponseEntity<TestState> getTest(@PathVariable String testName) {
        return ResponseEntity.status(HttpStatus.OK).body(testService.getTest(testName));
    }

    @DeleteMapping("/{testName}")
    public ResponseEntity<Void> deleteTest(@PathVariable String testName) {
        testService.deleteTest(testName);
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @GetMapping
    public ResponseEntity<Map<String, TestState>> getAllTests() {
        return ResponseEntity.status(HttpStatus.OK).body(testService.getAllTests());
    }

}