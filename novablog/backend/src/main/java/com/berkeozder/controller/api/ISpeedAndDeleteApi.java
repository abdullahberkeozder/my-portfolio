package com.berkeozder.controller.api;

import com.berkeozder.error.ApiResult;
import org.springframework.http.ResponseEntity;

import java.util.List;

/**
 * Controller interface contract for test data seeding and cleanup.
 *
 * @param <D> DTO type
 */
public interface ISpeedAndDeleteApi<D> {

    ResponseEntity<ApiResult<List<D>>> speedData(Integer data);

    ResponseEntity<ApiResult<List<D>>> deleteData();
}
