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
import { ProjectTree } from '../../pageobjects/ide/ProjectTree';
import { ICheLoginPage } from '../../pageobjects/login/ICheLoginPage';
import { TestConstants } from '../../TestConstants';
import { DriverHelper } from '../../utils/DriverHelper';
import { TestWorkspaceUtil } from '../../utils/workspace/TestWorkspaceUtil';



const driverHelper: DriverHelper = e2eContainer.get(CLASSES.DriverHelper);
const ide: Ide = e2eContainer.get(CLASSES.Ide);
const namespace: string = TestConstants.TS_SELENIUM_USERNAME;
const workspaceName: string = TestConstants.TS_SELENIUM_HAPPY_PATH_WORKSPACE_NAME;
const loginPage: ICheLoginPage = e2eContainer.get<ICheLoginPage>(TYPES.CheLogin);
const projectTree: ProjectTree = e2eContainer.get(CLASSES.ProjectTree);
const testWorkspaceUtils: TestWorkspaceUtil = e2eContainer.get<TestWorkspaceUtil>(TYPES.WorkspaceUtil);


suite('Git with ssh workflow', async () => {
    const workspacePrefixUrl: string = `${TestConstants.TS_SELENIUM_BASE_URL}/dashboard/#/ide/${TestConstants.TS_SELENIUM_USERNAME}/`;


    suiteSetup(async function () {

        const wsConfig = await testWorkspaceUtils.getBaseDevfile();
        wsConfig.components = [
            {
                'id': 'redhat/vscode-openshift-connector/latest',
                'type': 'chePlugin'
            }
        ];

        await testWorkspaceUtils.createWsFromDevFile(wsConfig);
    });

    test('Login into workspace and open tree container', async () => {
        const wsConfig = await testWorkspaceUtils.getBaseDevfile();
        await driverHelper.navigateToUrl(workspacePrefixUrl + wsConfig.metadata!.name);
        await loginPage.login();
        await ide.waitWorkspaceAndIde(namespace, workspaceName);
        await projectTree.openProjectTreeContainer();
    });

});




