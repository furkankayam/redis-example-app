package com.redisexample.model.state;

import java.time.ZonedDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestState {

    private String testName;
    private String testExample;
    private ZonedDateTime createdAt = ZonedDateTime.now();

}