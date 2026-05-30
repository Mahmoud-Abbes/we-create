package com.wecreate.api.services.dashboard.billing;

import com.wecreate.api.models.Project;
import com.wecreate.api.repositories.dashboard.InvoiceRepository;
import com.wecreate.api.repositories.dashboard.ProjectRepository;
import com.wecreate.api.services.dashboard.payment.InvoiceService;
import com.wecreate.api.services.dashboard.project.ProjectAccessService;
import com.wecreate.api.shared.dtos.dashboard.InvoicesAndDeploymentResponse;
import com.wecreate.api.shared.dtos.dashboard.InvoiceResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvoicesAndDeploymentService {

    private final ProjectAccessService projectAccessService;
    private final ProjectRepository projectRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceService invoiceService;

    @Transactional(readOnly = true)
    public InvoicesAndDeploymentResponse getForProject(UUID userId, String slug) {
        Project project = projectAccessService.requireOwnerProject(userId, slug);

        List<InvoiceResponse> invoices = invoiceRepository
                .findByUserIdAndProject_SlugOrderByPaidAtDesc(userId, slug)
                .stream()
                .map(invoiceService::toResponse)
                .toList();

        return new InvoicesAndDeploymentResponse(
                invoices,
                project.isDeployable(),
                project.getSubStatus(),
                project.getBillingPlan(),
                project.getPeriodEndAt(),
                project.getSlug()
        );
    }

    @Transactional
    public void setDeployable(UUID userId, String slug, boolean deployable) {
        Project project = projectAccessService.requireOwnerProject(userId, slug);
        project.setDeployable(deployable);
        projectRepository.save(project);
    }
}
