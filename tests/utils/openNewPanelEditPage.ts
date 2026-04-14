import type { DashboardPage, PanelEditPage } from '@grafana/plugin-e2e';

type GotoPanelEditPage = (args: { id: string }) => Promise<PanelEditPage>;

export async function openNewPanelEditPage({
  dashboardPage,
  gotoPanelEditPage,
  grafanaVersion,
}: {
  dashboardPage: DashboardPage;
  gotoPanelEditPage: GotoPanelEditPage;
  grafanaVersion: string;
}): Promise<PanelEditPage> {
  // TODO: Remove this Grafana 13.0.0 workaround once @grafana/plugin-e2e is updated for the missing configure panel selector.
  if (grafanaVersion === '13.0.0') {
    const panelEditPage = await gotoPanelEditPage({ id: '1' });
    await dashboardPage.ctx.page.getByRole('button', { name: 'Panel', exact: true }).click();
    await dashboardPage.ctx.page.getByRole('button', { name: 'Configure visualization' }).click();
    return panelEditPage;
  }

  return dashboardPage.addPanel();
}
