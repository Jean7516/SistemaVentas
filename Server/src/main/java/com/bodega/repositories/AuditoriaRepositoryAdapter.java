package com.bodega.repositories;

import com.bodega.domain.entities.Auditoria;
import com.bodega.domain.ports.AuditoriaRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class AuditoriaRepositoryAdapter implements AuditoriaRepository {

    private final EntityManager em;

    @Override
    public List<Auditoria> buscar(String tabla, Instant desde, Instant hasta, int limit, int offset) {
        var cb = em.getCriteriaBuilder();
        var cq = cb.createQuery(Auditoria.class);
        var root = cq.from(Auditoria.class);

        var predicates = new ArrayList<Predicate>();
        if (tabla != null) {
            predicates.add(cb.equal(root.get("tablaAfectada"), tabla));
        }
        if (desde != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("fechaHora"), desde));
        }
        if (hasta != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("fechaHora"), hasta));
        }

        cq.where(predicates.toArray(new Predicate[0]));
        cq.orderBy(cb.desc(root.get("fechaHora")));

        return em.createQuery(cq)
                .setFirstResult(offset)
                .setMaxResults(limit)
                .getResultList();
    }

    @Override
    public long contar(String tabla, Instant desde, Instant hasta) {
        var cb = em.getCriteriaBuilder();
        var cq = cb.createQuery(Long.class);
        var root = cq.from(Auditoria.class);

        var predicates = new ArrayList<Predicate>();
        if (tabla != null) {
            predicates.add(cb.equal(root.get("tablaAfectada"), tabla));
        }
        if (desde != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("fechaHora"), desde));
        }
        if (hasta != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("fechaHora"), hasta));
        }

        cq.select(cb.count(root));
        cq.where(predicates.toArray(new Predicate[0]));

        return em.createQuery(cq).getSingleResult();
    }
}
