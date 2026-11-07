package com.berkeozder.controller.api.interfaces;

import com.berkeozder.controller.api.ICrudApi;
import com.berkeozder.controller.api.IImageApi;
import com.berkeozder.controller.api.ISortingPagingApi;
import com.berkeozder.controller.api.ISpeedAndDeleteApi;

// D: Dto
public interface IBlogApi<D> extends
        ISpeedAndDeleteApi<D>,
        ICrudApi<D>,
        IImageApi<D>,
        ISortingPagingApi<D>
{
}
