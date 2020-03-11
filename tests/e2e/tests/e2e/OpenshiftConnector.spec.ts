/*********************************************************************
 * Copyright (c) 2019 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

import { test } from 'mocha';
import { e2eContainer } from '../../inversify.config';
import { CLASSES, TYPES } from '../../inversify.types';
import { Ide } from '../../pageobjects/ide/Ide';
import { Dashboard } from '../../pageobjects/dashboard/Dashboard';
import { ICheLoginPage } from '../../pageobjects/login/ICheLoginPage';
import { TestConstants } from '../../TestConstants';
import { DriverHelper } from '../../utils/DriverHelper';
import { TestWorkspaceUtil } from '../../utils/workspace/TestWorkspaceUtil';
import { OpenshiftPlugin, OpenshiftAppExplorerToolbar, OpenshiftContextMenuItems } from '../../pageobjects/ide/OpenshiftPlugin';
import { QuickOpenContainer } from '../../pageobjects/ide/QuickOpenContainer';
import { ProjectTree } from '../../pageobjects/ide/ProjectTree';
import { DialogWindow } from '../../pageobjects/ide/DialogWindow';

const driverHelper: DriverHelper = e2eContainer.get(CLASSES.DriverHelper);
const warningDialog: DialogWindow = e2eContainer.get(CLASSES.DialogWindow);
const ide: Ide = e2eContainer.get(CLASSES.Ide);
const loginPage: ICheLoginPage = e2eContainer.get<ICheLoginPage>(TYPES.CheLogin);
const testWorkspaceUtils: TestWorkspaceUtil = e2eContainer.get<TestWorkspaceUtil>(TYPES.WorkspaceUtil);
const openshiftPlugin: OpenshiftPlugin = e2eContainer.get(CLASSES.OpenshiftPlugin);
const dashBoard: Dashboard = e2eContainer.get(CLASSES.Dashboard);
const namespace: string = TestConstants.TS_SELENIUM_USERNAME;
const quickOpenContainer: QuickOpenContainer = e2eContainer.get(CLASSES.QuickOpenContainer);
const projectTree: ProjectTree = e2eContainer.get(CLASSES.ProjectTree);

suite('Openshift connector user story', async () => {
    const workspacePrefixUrl: string = `${TestConstants.TS_SELENIUM_BASE_URL}/dashboard/#/ide/${TestConstants.TS_SELENIUM_USERNAME}/`;
    let wsName: string;
    suiteSetup(async function () {
        const wsConfig = await testWorkspaceUtils.getBaseDevfile();
        wsName = wsConfig!.metadata!.name!;
        wsConfig.components = [
            {
                'id': 'redhat/vscode-openshift-connector/latest',
                'type': 'chePlugin'
            }
        ];

        await testWorkspaceUtils.createWsFromDevFile(wsConfig);
    });

    test('Login into waorkspace and open plugin', async () => {
        await driverHelper.navigateToUrl(workspacePrefixUrl + wsName);
        await loginPage.login();
        await ide.waitWorkspaceAndIde(namespace, wsName);
        await dashBoard.waitDisappearanceNavigationMenu();
        await openshiftPlugin.clickOnOpenshiftToollBarIcon();
        await openshiftPlugin.waitOpenshiftConnectorTree();
        
    });



    test('Login into current cluster', async()=>{
        const provideAuthenticationSuffix: string = 'for basic authentication to the API server (Press \'Enter\' to confirm your input or \'Escape\' to cancel)';
        const loginIntoClusterMessage: string = 'You are already logged in the cluster. Do you want to login to a different cluster?';
        const openshiftIP: string = await openshiftPlugin.getClusterIP();
        await openshiftPlugin.clickOnApplicationToolbarItem(OpenshiftAppExplorerToolbar.LogIntoCluster);
        await ide.clickOnNotificationButton(loginIntoClusterMessage, 'Yes');
        await quickOpenContainer.clickOnContainerItem('Credentials');
        await quickOpenContainer.clickOnContainerItem(`https://${openshiftIP}`);
        await quickOpenContainer.clickOnContainerItem('$(plus) Add new user...');
        await quickOpenContainer.typeAndSelectSuggestion('developer', `Provide Username ${provideAuthenticationSuffix}`);
        await quickOpenContainer.typeAndSelectSuggestion('123', `Provide Password ${provideAuthenticationSuffix}`);
    });

    test('Create new component', async()=>{
        await openshiftPlugin.invokeContextMenuCommandOnItem('myproject', OpenshiftContextMenuItems.NewComponent);
        await quickOpenContainer.clickOnContainerItem('$(plus) Create new Application...');
        await quickOpenContainer.typeAndSelectSuggestion('component', 'Provide Application name (Press \'Enter\' to confirm your input or \'Escape\' to cancel)');
        await quickOpenContainer.clickOnContainerItem('Workspace Directory');
        await quickOpenContainer.clickOnContainerItem('$(plus) Add new context folder.');
        await warningDialog.waitDialog();
   });

});




