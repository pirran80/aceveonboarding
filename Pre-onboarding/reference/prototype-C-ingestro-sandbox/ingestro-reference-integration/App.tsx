import { useCallback, useMemo } from "react";
import { ColumnAPI, NuvoImporter, OnResults, PassSubmitResult } from "@getnuvo/importer-react";
import type { MappingLayer, ProcessingMode } from "@getnuvo/importer-react";
import {
  buildCsvBlob,
  STUDENT_CSV_COLUMNS,
  THINKIFIC_SAMPLE_ROWS,
} from "./utils";
import "./styles.css";

const LICENSE_KEY = "thinkific-noncommercial-demo-0001";
const IMPORTER_IDENTIFIER = "thinkific-students-importer";

const SIDEBAR_LINKS = ["Home", "Products", "Channels", "Marketing", "Sales"];
const USER_NAV_LINKS = [
  "All users",
  "Groups",
  "Certificates",
  "Notification emails",
  "Student progress",
  "Discussions",
  "Assignments",
  "Quiz and survey",
  "Reviews",
];
const FOOTER_LINKS = ["Analytics", "Account", "Integrations", "Settings"];

const SAMPLE_USERS = [
  {
    name: "Laura Becker",
    amount: "$0.00",
    date: "Nov 17, 2025",
    email: "laura.becker@importly.co",
    enrollments: "2",
    source: "CSV upload",
    lastSignIn: "Today",
  },
  {
    name: "Harper Moreno",
    amount: "$39.00",
    date: "Nov 01, 2025",
    email: "harper@thinklab.com",
    enrollments: "5",
    source: "Manual invite",
    lastSignIn: "3d ago",
  },
  {
    name: "Darius Clarke",
    amount: "$0.00",
    date: "Sep 24, 2025",
    email: "darius.clarke@workshop.org",
    enrollments: "1",
    source: "CSV upload",
    lastSignIn: "1w ago",
  },
];

const STUDENT_COLUMNS: ColumnAPI[] = [
  {
    key: "student_email",
    label: "Student email",
    columnType: "email",
    validations: [{ validate: "required" }],
  },
  {
    key: "first_name",
    label: "First name",
    columnType: "string",
    validations: [{ validate: "required" }],
  },
  {
    key: "last_name",
    label: "Last name",
    columnType: "string",
    validations: [{ validate: "required" }],
  },
  {
    key: "courses",
    label: "Courses",
    columnType: "string",
    validations: [{ validate: "required" }],
  },
];

const MAPPING_LAYERS: MappingLayer[] = ["exact", "historic", "smart", "fuzzy"];
const DATA_PROCESSING_MODE: ProcessingMode = "browser";

export default function App(): JSX.Element {
  const brandTokens = useMemo(
    () => ({ primary: "#1b60d1", accent: "#f4f6fb" }),
    []
  );

  const importerSettings = useMemo(
    () => ({
      developerMode: false,
      identifier: IMPORTER_IDENTIFIER,
      allowManualInput: true,
      modal: true,
      disableTemplates: true,
      columns: STUDENT_COLUMNS,
      columnMappingConfiguration: {
        processingMode: DATA_PROCESSING_MODE,
        layers: MAPPING_LAYERS,
        threshold: 0.65,
      },
      prompts: true,
      style: {
        globals: {
          primaryColor: brandTokens.primary,
          secondaryColor: brandTokens.primary,
        },
      },
    }),
    [brandTokens]
  );

  const downloadMockCsv = useCallback(() => {
    const blob = buildCsvBlob(THINKIFIC_SAMPLE_ROWS, STUDENT_CSV_COLUMNS);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "thinkific-students-template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleResults = useCallback<OnResults>((results, _errors, complete) => {
    complete(
      new PassSubmitResult({
        successfulRecords: results.length,
        failedRecords: 0,
        title: "Import complete",
        text: `${results.length} rows imported successfully.`,
        imageUrl:
          "https://support.thinkific.com/hc/theming_assets/01K0CT67RVPD3W4YBV69HSZDMC",
      })
    );
  }, []);

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <span className="logo-pill">Thinkific</span>
        </div>
        <nav className="sidebar-nav">
          {SIDEBAR_LINKS.map((link) => (
            <button key={link} className="sidebar-link" type="button">
              <span className="sidebar-icon" aria-hidden="true">
                ●
              </span>
              {link}
            </button>
          ))}
        </nav>
        <div className="sidebar-section">
          <p className="sidebar-section-label">Users</p>
          <ul className="sidebar-sublist">
            {USER_NAV_LINKS.map((item) => (
              <li key={item}>
                <button
                  className={`sidebar-sublink ${
                    item === "All users" ? "active" : ""
                  }`}
                  type="button"
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="sidebar-nav">
          {FOOTER_LINKS.map((link) => (
            <button key={link} className="sidebar-link" type="button">
              <span className="sidebar-icon" aria-hidden="true">
                ●
              </span>
              {link}
            </button>
          ))}
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="main-header-grid">
          <div className="header-content">
            <div>
              <p className="eyebrow">Users</p>
              <h1>All users</h1>
              <p className="lead">
                Manage learner access, track activity, and import new students.
              </p>
            </div>

            <div className="search-row">
              <div className="search-input">
                <span aria-hidden="true">🔍</span>
                <input placeholder="Search by email or name" />
              </div>
              <div className="header-actions">
                <button className="ghost-btn" type="button">
                  Filters
                </button>
                <button className="ghost-btn" type="button">
                  Views
                </button>
                <button className="primary-cta" type="button">
                  + New user
                </button>
              </div>
            </div>
          </div>

          <div className="import-card">
            <div className="import-card-header">
              <div className="import-icon" aria-hidden="true">
                📁
              </div>
              <div>
                <p className="card-eyebrow">Import from file</p>
                <p className="card-copy">
                  With the Grow plan, you can create multiple users at once from
                  an XLSX or CSV file.
                </p>
              </div>
            </div>
            <div className="import-card-actions">
              <NuvoImporter
                licenseKey={LICENSE_KEY}
                settings={importerSettings}
                onResults={handleResults}
              />
              <button className="upgrade-btn" type="button">
                Upgrade now
              </button>
            </div>
            <div className="template-link-row">
              <button className="link-btn" onClick={downloadMockCsv} type="button">
                Download sample CSV
              </button>
            </div>
          </div>
        </div>

        <section className="table-card">
          <div className="table-toolbar">
            <div className="toolbar-actions">
              <button className="icon-button" type="button">
                ☐
              </button>
              <button className="text-link" type="button">
                Select all
              </button>
            </div>
            <div className="toolbar-actions">
              <button className="ghost-btn" type="button">
                <span aria-hidden="true">+</span> Actions
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            <div className="table-row table-row--header">
              <div className="table-cell">Full name</div>
              <div className="table-cell">Amount spent</div>
              <div className="table-cell">Date created</div>
              <div className="table-cell">Email</div>
              <div className="table-cell">Enrollments</div>
              <div className="table-cell">External source</div>
              <div className="table-cell">Last sign in</div>
            </div>
            {SAMPLE_USERS.map((user) => (
              <div key={user.email} className="table-row">
                <div className="table-cell">{user.name}</div>
                <div className="table-cell">{user.amount}</div>
                <div className="table-cell">{user.date}</div>
                <div className="table-cell">{user.email}</div>
                <div className="table-cell">{user.enrollments}</div>
                <div className="table-cell">{user.source}</div>
                <div className="table-cell">{user.lastSignIn}</div>
              </div>
            ))}
          </div>

          <div className="table-footer">
            <p>1 Users</p>
            <div className="pagination">
              <button className="ghost-btn" type="button">
                ←
              </button>
              <span className="pagination-active">1</span>
              <button className="ghost-btn" type="button">
                →
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
