package com.berkeozder.business.services.interfaces;

import com.berkeozder.business.services.ICrudService;
import com.berkeozder.business.services.IModelMapperService;
import com.berkeozder.business.services.ISpeedAndDeleteService;

// D: Dto
// E: Entity
public interface IBlogCategoryServices<D,E> extends
        IModelMapperService<D,E>,
        ISpeedAndDeleteService<D,E>,
        ICrudService<D,E>
        {
}
