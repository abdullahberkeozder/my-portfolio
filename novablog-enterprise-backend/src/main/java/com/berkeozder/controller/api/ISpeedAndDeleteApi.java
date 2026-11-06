package com.berkeozder.controller.api;

import com.berkeozder.error.ApiResult;
import org.springframework.http.ResponseEntity;

import java.util.List;

// D: Dto
public interface ISpeedAndDeleteApi<D> {

    // SPEED CREATE & DELETE
    // SPEED DATA
    public ResponseEntity<ApiResult<List<D>>>  speedData(Integer data);

    // DELETE ALL
    public ResponseEntity<ApiResult<List<D>>> deleteData();

}
