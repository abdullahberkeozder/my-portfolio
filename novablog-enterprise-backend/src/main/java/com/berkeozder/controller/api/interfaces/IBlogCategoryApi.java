package com.berkeozder.controller.api.interfaces;

import com.berkeozder.controller.api.ICrudApi;
import com.berkeozder.controller.api.ISpeedAndDeleteApi;

// D: Dto
public interface IBlogCategoryApi <D> extends
        ISpeedAndDeleteApi<D>,
        ICrudApi<D>
{
}
