package com.berkeozder.business.services;

import java.util.List;

/**
 * Interface contract for mock speed data generation and batch clearing.
 *
 * @param <D> DTO type
 * @param <E> Entity type
 */
public interface ISpeedAndDeleteService<D, E> {

    List<D> speedData(Integer data);

    List<D> deleteData();
}
