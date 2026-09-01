const BASE_URL = 'http://localhost:5000';

async function testEndpoint(name, method, url, body = null) {
    console.log(`\nTesting ${name}...`);
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        if (body) {
            options.body = JSON.stringify(body);
        }

        const res = await fetch(`${BASE_URL}${url}`, options);
        let data = null;
        try {
            data = await res.json();
        } catch (e) {
            data = await res.text();
        }

        if (res.ok) {
            console.log(`Ã¢Å“â€¦ [PASS] ${method} ${url} (Status: ${res.status})`);
            return { success: true, data };
        } else {
            console.log(`Ã¢ÂÅ’ [FAIL] ${method} ${url} (Status: ${res.status})`);
            console.log(`   Response:`, data);
            return { success: false, data };
        }
    } catch (err) {
        console.log(`Ã¢ÂÅ’ [FAIL] ${method} ${url} - Exception: ${err.message}`);
        return { success: false, error: err.message };
    }
}

async function runTests() {
    console.log("=====================================");
    console.log("   BLACKSTONE INTERIOR - API TEST SUITE    ");
    console.log("=====================================");

    // --- 1. CRM MODULE ---
    console.log("\n--- CRM MODULE ---");
    // POST Contact
    let crmPost = await testEndpoint('Create CRM Contact', 'POST', '/api/crm', {
        name: 'Test Contact',
        organizationName: 'Test Org',
        phone: '1234567890',
        email: 'test@example.com',
        project: 'Test Project',
        address: '123 Test St',
        status: 'Hot',
        source: 'Website',
        tags: ['test']
    });
    
    let contactId = null;
    if (crmPost.success && crmPost.data.id) {
        contactId = crmPost.data.id;
    }

    // GET Contacts
    await testEndpoint('Get CRM Contacts', 'GET', '/api/crm');

    // PUT Contact
    if (contactId) {
        await testEndpoint('Update CRM Contact', 'PUT', `/api/crm/${contactId}`, {
            name: 'Updated Contact',
            organizationName: 'Updated Org',
            phone: '0987654321',
            email: 'updated@example.com',
            project: 'Test Project',
            address: '123 Test St',
            status: 'Cold',
            source: 'Website',
            tags: ['updated']
        });
    }

    // DELETE Contact
    if (contactId) {
        await testEndpoint('Delete CRM Contact', 'DELETE', `/api/crm/${contactId}`);
    }

    // --- 2. HR MODULE (Employees) ---
    console.log("\n--- HR MODULE (Employees) ---");
    let empPost = await testEndpoint('Create Employee', 'POST', '/api/employees', {
        name: 'Test Employee',
        role: 'Tester',
        department: 'QA',
        phone: '1234567890',
        email: 'employee@example.com',
        salary: 50000,
        joinDate: '2026-08-01',
        status: 'Active',
        address: '123 Test St',
        advanceBalance: 0,
        bankDetails: 'Bank of Test',
        govId: 'TESTID123',
        salaryType: 'Monthly',
        workerId: ''
    });

    let empId = null;
    if (empPost.success && empPost.data.id) {
        empId = empPost.data.id;
    }

    await testEndpoint('Get Employees', 'GET', '/api/employees');

    if (empId) {
        await testEndpoint('Update Employee', 'PUT', `/api/employees/${empId}`, {
            name: 'Updated Employee',
            role: 'Senior Tester',
            department: 'QA',
            phone: '0987654321',
            email: 'updated_emp@example.com',
            salary: 60000,
            joinDate: '2026-08-01',
            status: 'Active',
            address: '123 Test St',
            advanceBalance: 500,
            bankDetails: 'Bank of Test',
            govId: 'TESTID123',
            salaryType: 'Monthly',
            workerId: ''
        });
        await testEndpoint('Delete Employee', 'DELETE', `/api/employees/${empId}`);
    }


    // --- 3. FINANCE MODULE (Expenses) ---
    console.log("\n--- FINANCE MODULE (Expenses) ---");
    let expPost = await testEndpoint('Create Expense', 'POST', '/api/finance/expenses', {
        date: '2026-08-01',
        category: 'Supplies',
        description: 'Test Expense',
        amount: 150.50,
        clientId: '0',
        type: 'Debit'
    });

    let expId = null;
    if (expPost.success && expPost.data.id) {
        expId = expPost.data.id;
    }

    await testEndpoint('Get Expenses', 'GET', '/api/finance/expenses');

    if (expId) {
        await testEndpoint('Update Expense', 'PUT', `/api/finance/expenses/${expId}`, {
            date: '2026-08-02',
            category: 'Supplies',
            description: 'Updated Expense',
            amount: 200.00,
            clientId: '0',
            type: 'Debit'
        });
        await testEndpoint('Delete Expense', 'DELETE', `/api/finance/expenses/${expId}`);
    }

    // --- 4. QUOTATIONS MODULE ---
    console.log("\n--- QUOTATIONS MODULE ---");
    let quotePost = await testEndpoint('Create Quotation', 'POST', '/api/quotations', {
        clientName: 'Test Client',
        organizationName: 'Test Org',
        clientAddress: '123 Test St',
        projectTitle: 'Test Project',
        workDescription: 'Test Work',
        date: '2026-08-01',
        billType: 'GST',
        items: [],
        total: 1000.00
    });

    let quoteId = null;
    if (quotePost.success && quotePost.data.id) {
        quoteId = quotePost.data.id;
    }

    await testEndpoint('Get Quotations', 'GET', '/api/quotations');

    if (quoteId) {
        await testEndpoint('Update Quotation', 'PUT', `/api/quotations/${quoteId}`, {
            quoteNo: quotePost.data.quoteNo,
            clientName: 'Updated Client',
            organizationName: 'Test Org',
            clientAddress: '123 Test St',
            projectTitle: 'Updated Project',
            workDescription: 'Updated Work',
            date: '2026-08-01',
            billType: 'GST',
            items: [],
            total: 1500.00,
            status: 'Approved'
        });
        await testEndpoint('Delete Quotation', 'DELETE', `/api/quotations/${quoteId}`);
    }

    // --- 5. SITES MODULE ---
    console.log("\n--- SITES MODULE ---");
    let sitePost = await testEndpoint('Create Site', 'POST', '/api/sites', {
        name: 'Test Site',
        clientName: 'Test Client',
        organizationName: 'Test Org',
        assignedTeam: 'Team A',
        address: '123 Test St',
        status: 'Ongoing',
        startDate: '2026-08-01',
        budget: 50000,
        description: 'Test Site Description',
        isNegotiated: false,
        negotiationDetails: '',
        isArchived: false,
        workHistory: [],
        maintenance: {}
    });

    let siteId = null;
    if (sitePost.success && sitePost.data.id) {
        siteId = sitePost.data.id;
    }

    await testEndpoint('Get Sites', 'GET', '/api/sites');

    if (siteId) {
        await testEndpoint('Update Site', 'PUT', `/api/sites/${siteId}`, {
            name: 'Updated Site',
            clientName: 'Updated Client',
            organizationName: 'Test Org',
            assignedTeam: 'Team B',
            address: '123 Test St',
            status: 'Completed',
            startDate: '2026-08-01',
            budget: 60000,
            description: 'Updated Site Description',
            isNegotiated: true,
            negotiationDetails: 'Agreed on 60k',
            isArchived: false
        });
        await testEndpoint('Delete Site', 'DELETE', `/api/sites/${siteId}`);
    }

    console.log("\nÃ¢Å“â€¦ All Endpoints Tested.");
}

runTests();
