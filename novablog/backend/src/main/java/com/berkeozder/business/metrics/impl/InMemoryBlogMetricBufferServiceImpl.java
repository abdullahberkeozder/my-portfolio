package com.berkeozder.business.metrics.impl;

import com.berkeozder.business.metrics.IBlogMetricBufferService;
import lombok.extern.log4j.Log4j2;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.LongAdder;

/**
 * Thread-safe In-Memory Blog Metrik Tamponlayıcı (LongAdder tabanlı).
 * Dağıtık Redis aktif olmadığında veya yerel/test ortamlarında sıfır gecikmeli
 * ve kilitlenmesiz (lock-free contention striping) metrik tamponlama sağlar.
 *
 * @author Berke Özder
 */
@Log4j2
public class InMemoryBlogMetricBufferServiceImpl implements IBlogMetricBufferService {

    private final ConcurrentHashMap<Long, LongAdder> viewBuffer = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Long, LongAdder> likeBuffer = new ConcurrentHashMap<>();

    @Override
    public void incrementView(Long blogId) {
        if (blogId == null) return;
        viewBuffer.computeIfAbsent(blogId, k -> new LongAdder()).increment();
    }

    @Override
    public void incrementLike(Long blogId) {
        if (blogId == null) return;
        likeBuffer.computeIfAbsent(blogId, k -> new LongAdder()).increment();
    }

    @Override
    public void decrementLike(Long blogId) {
        if (blogId == null) return;
        likeBuffer.computeIfAbsent(blogId, k -> new LongAdder()).decrement();
    }

    @Override
    public long getBufferedViews(Long blogId) {
        if (blogId == null) return 0L;
        LongAdder adder = viewBuffer.get(blogId);
        return adder != null ? adder.sum() : 0L;
    }

    @Override
    public long getBufferedLikes(Long blogId) {
        if (blogId == null) return 0L;
        LongAdder adder = likeBuffer.get(blogId);
        return adder != null ? adder.sum() : 0L;
    }

    @Override
    public Map<Long, Long> drainViewBuffer() {
        return drainBuffer(viewBuffer);
    }

    @Override
    public Map<Long, Long> drainLikeBuffer() {
        return drainBuffer(likeBuffer);
    }

    @Override
    public boolean isBufferEmpty() {
        return viewBuffer.isEmpty() && likeBuffer.isEmpty();
    }

    private Map<Long, Long> drainBuffer(ConcurrentHashMap<Long, LongAdder> buffer) {
        Map<Long, Long> drained = new HashMap<>();
        buffer.forEach((blogId, adder) -> {
            long delta = adder.sumThenReset();
            if (delta != 0) {
                drained.put(blogId, delta);
            }
        });
        // Sıfırlanmış girdileri haritadan temizle (bellek sızıntısını önler)
        buffer.entrySet().removeIf(entry -> entry.getValue().sum() == 0);
        return drained;
    }
}

