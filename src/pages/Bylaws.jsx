import React, { useState } from 'react';
import { BylawsIcon, SearchIcon } from '../components/Icons';

export default function Bylaws() {
  const [activeSubTab, setActiveSubTab] = useState('explorer'); // 'explorer' or 'pdf'
  const [searchTerm, setSearchTerm] = useState('');
  const [activeArticle, setActiveArticle] = useState('art-2'); // default to definitions
  
  // PDF state
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfZoom, setPdfZoom] = useState(100);
  const [customPdfUrl, setCustomPdfUrl] = useState(() => {
    return localStorage.getItem('summit_custom_pdf') || null;
  });

  // Table of Contents & Covenants Data
  const covenants = [
    {
      id: 'preamble',
      title: 'Declaration Preamble',
      content: `THE SUMMIT AT CHEAT LAKE DECLARATION
THIS DECLARATION is made and entered into this 3rd day of October, 2008, by The Summit at Cheat Lake, LLC, a West Virginia limited liability company ("Declarant").

WHEREAS, Declarant owns and holds title to certain real property located and situate in Union District, Monongalia County, West Virginia, which Declarant intends to develop into a planned community; and

WHEREAS, Declarant intends to subject such property to the conditions, covenants, restrictions, exceptions, reservations, easements, rights of way, and limitations set forth and contained in this Declaration...`
    },
    {
      id: 'art-1',
      title: 'Article I: The Act',
      content: `1.01. Applicability of the Act: Declarant hereby subjects and submits the Property, as a planned community, to the terms and provisions of the Act (Uniform Common Interest Ownership Act, Chapter 36B of the West Virginia Code).`
    },
    {
      id: 'art-2',
      title: 'Article II: Definitions',
      content: `2.01. Act: The Uniform Common Interest Ownership Act, Chapter 36B of the West Virginia Code, as the same may be amended from time to time.
      
2.02. Architectural Review Committee (ARC): The committee which shall ensure quality development of the Property and maintain an attractive general character or scheme of development by approving or disapproving virtually all proposed improvements to the Addresses.

2.04. Association: The Summit at Cheat Lake Property Owners' Association, Inc., a non-profit corporation, organized under the laws of the State of West Virginia, and any wholly-owned subsidiary thereof, its successors and assigns.

2.06. Bylaws: The bylaws of the Association and any and all amendments and modifications thereof and supplements thereto.

2.08. Common Elements: All areas on the Plat labeled "Common Areas", all streets, roads, easements, rights of way (including easements and rights of way over the Addresses...)

2.11. Community: The Planned Common Interest Community consisting of residential living units known as The Summit at Cheat Lake.

2.25. Address (formerly Unit): A physical portion of the Property designated for separate ownership or occupancy.

2.26. Address Owner: Any and every record owner, whether Declarant or another Person, whether one or more Persons, of any undivided interest in any Address...`
    },
    {
      id: 'art-4',
      title: 'Article IV: The Association',
      content: `4.01. Membership: Each and every Address Owner shall be a Member of the Association, and shall be subject to the provisions of the Act, this Declaration, the Articles, the Bylaws, and the rules and regulations adopted or promulgated by the Association.

4.02. Powers of the Association: Subject to the provisions of the Act and this Declaration, the Association may:
(1) Adopt and amend the Bylaws, rules, and regulations;
(2) Adopt and amend budgets for revenues, expenditures, and reserves, and levy, assess, and collect annual and special assessments for Common Expenses;
(3) Hire and discharge managing agents and other employees, agents, and independent contractors;
(6) Regulate the use, maintenance, repair, replacement, and modification of Common Elements...`
    },
    {
      id: 'art-7',
      title: 'Article VII: Restrictions & Covenants',
      content: `7.01. Applicability: The Restrictions set forth and contained in this Declaration shall be applicable to the Property and each and every Address or lot thereof or therefrom...

7.02. Permitted Uses: Subject to the provisions of Section 6.02, Addresses shall be used solely and exclusively for residential purposes by either single families or no more than three (3) unrelated persons.

7.03. Number of Dwellings: Subject to the provisions of Section 6.02, no more than one (1) residential dwelling shall be constructed, erected, or built on any Address.

7.08. ARC Approval: No building, structure, or improvements of any kind, including, but not limited to, fences and walls, shall be commenced, constructed, erected, built, placed, altered, or maintained on any Address without the prior written approval of the ARC.

7.09. Set Back: No building, structure or improvement of any kind shall be constructed, erected, or built, or in any manner located nearer than:
a) All setbacks from Ridge of Summit Drive are 35 feet;
b) 35 feet from all rear property lines;
c) 15 feet from each adjoining lot line for Lots 1-20;
d) 25 feet from each adjoining lot line for Lots 21-41; and
e) 35 feet front setbacks from roadway right of way for Lots 1-8 and 21-41; and 25 feet front setbacks for Lots 9-20.

7.19. Vehicles: No unlicensed vehicles, junk vehicles, vehicles exceeding two (2) tons gross vehicular weight, trailers, campers or recreational vehicles shall be parked or stored on any Address unless parked or stored in an enclosed garage.

7.20. Trash Receptacles: All trash, garbage, rubbish, and other waste shall be kept in containers maintained in a neat, clean, and sanitary condition. Such containers shall be kept and maintained in such a manner so as not to be visible to public view...`
    },
    {
      id: 'amend-1',
      title: 'First Amendment (Nov 17, 2008)',
      content: `FIRST AMENDMENT TO THE SUMMIT AT CHEAT LAKE DECLARATION
This First Amendment to The Summit at Cheat Lake Declaration is made and entered into this 17th day of November, 2008, by The Summit at Cheat Lake, LLC.

RECITALS
4. Pursuant to Paragraph 6.01 of the Declaration, Declarant desires to amend the Declaration to include the Phase I Plats into the terms and conditions and include Phase II of the Community, which shall consist of Addresses 42 to 89, inclusive...

AMENDMENTS
3. Paragraph numbered 7.09 shall be amended by adding the following paragraph to Section 7.09:

7.09(a) Set Back Restrictions-Phase II Lots: For Addresses 42 to 89, inclusive, Phase II, no building, structure or improvement of any kind shall be constructed, erected, or built, or in any manner located nearer than:
a) 35 feet from Ridge of Summit Drive;
b) 25 feet from all front and rear boundary lines; and
c) 15 feet from all boundary lines that are not a front or rear boundary line and that adjoin another Address.`
    }
  ];

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomPdfUrl(reader.result);
        localStorage.setItem('summit_custom_pdf', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearCustomPdf = () => {
    setCustomPdfUrl(null);
    localStorage.removeItem('summit_custom_pdf');
  };

  // Filter content
  const filteredCovenants = covenants.map(item => {
    const contentLower = item.content.toLowerCase();
    const titleLower = item.title.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    if (contentLower.includes(searchLower) || titleLower.includes(searchLower)) {
      return item;
    }
    return null;
  }).filter(Boolean);

  const activeDoc = covenants.find(c => c.id === activeArticle);

  return (
    <div className="bylaws-page-container animate-fade-in">
      <div className="bylaws-header">
        <h1>By-Laws & Governing Documents</h1>
        <p className="subtitle">Official Declaration, Covenants, Conditions, and Restrictions of Summit HOA.</p>
      </div>

      <div className="bylaws-tabs">
        <button 
          className={`tab-btn ${activeSubTab === 'explorer' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('explorer')}
        >
          Interactive Rules Explorer
        </button>
        <button 
          className={`tab-btn ${activeSubTab === 'pdf' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('pdf')}
        >
          Original PDF Document Reader
        </button>
      </div>

      {activeSubTab === 'explorer' && (
        <div className="explorer-layout">
          {/* Sidebar: Table of Contents */}
          <div className="explorer-sidebar glass-panel">
            <div className="search-bar-wrapper">
              <SearchIcon className="search-icon" size={16} />
              <input
                type="text"
                className="form-control bylaws-search"
                placeholder="Search rules (e.g. setback)..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            <div className="toc-list">
              <h3>Table of Contents</h3>
              {covenants.map(item => (
                <button
                  key={item.id}
                  className={`toc-item ${activeArticle === item.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveArticle(item.id);
                    setSearchTerm(''); // Clear search on explicit select
                  }}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>

          {/* Main content display area */}
          <div className="explorer-content-panel glass-panel">
            {searchTerm ? (
              // Search Results mode
              <div className="search-results-mode">
                <h2>Search Results for "{searchTerm}"</h2>
                <div className="results-list">
                  {filteredCovenants.map(res => (
                    <div 
                      key={res.id} 
                      className="search-result-card glass-card"
                      onClick={() => {
                        setActiveArticle(res.id);
                        setSearchTerm('');
                      }}
                    >
                      <h3>{res.title}</h3>
                      <p className="snippet">
                        {res.content.slice(0, 180)}...
                      </p>
                      <span className="go-to-link">View Full Article</span>
                    </div>
                  ))}
                  {filteredCovenants.length === 0 && (
                    <div className="empty-results">No rules matched your search query.</div>
                  )}
                </div>
              </div>
            ) : (
              // Normal article reading mode
              <div className="article-reading-mode">
                <div className="article-meta">
                  <span className="badge badge-success">Official HOA Document</span>
                  <span className="doc-cite">Book 1374, Page 342-377</span>
                </div>
                <h2>{activeDoc.title}</h2>
                <div className="article-body-text">
                  {activeDoc.content.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'pdf' && (
        <div className="pdf-reader-panel glass-panel">
          {/* PDF reader toolbar */}
          <div className="pdf-toolbar">
            <div className="toolbar-left">
              <span className="toolbar-doc-title">Summit_Declaration_2008.pdf</span>
              <span className="divider">|</span>
              <div className="page-selectors">
                <button 
                  className="toolbar-btn" 
                  disabled={customPdfUrl || pdfPage === 1}
                  onClick={() => setPdfPage(p => Math.max(1, p - 1))}
                >
                  Previous Page
                </button>
                <span className="page-indicator">Page {customPdfUrl ? '1' : pdfPage} of {customPdfUrl ? '1' : '4'}</span>
                <button 
                  className="toolbar-btn" 
                  disabled={customPdfUrl || pdfPage === 4}
                  onClick={() => setPdfPage(p => Math.min(4, p + 1))}
                >
                  Next Page
                </button>
              </div>
            </div>

            <div className="toolbar-right">
              <div className="zoom-controls">
                <button className="toolbar-btn" onClick={() => setPdfZoom(z => Math.max(50, z - 25))}>-</button>
                <span className="zoom-level">{pdfZoom}%</span>
                <button className="toolbar-btn" onClick={() => setPdfZoom(z => Math.min(200, z + 25))}>+</button>
              </div>
              <span className="divider">|</span>
              
              {/* File Upload to replace with real PDF */}
              <div className="file-actions">
                <input
                  type="file"
                  id="pdf-covenant-upload"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  className="visually-hidden"
                />
                {customPdfUrl ? (
                  <button className="btn btn-secondary toolbar-btn-action reset-btn" onClick={clearCustomPdf}>
                    Reset Default
                  </button>
                ) : (
                  <label htmlFor="pdf-covenant-upload" className="btn btn-secondary toolbar-btn-action upload-label-btn">
                    Upload Custom PDF
                  </label>
                )}
                
                <a 
                  href={customPdfUrl || '#'} 
                  download="Summit_Declaration_2008.pdf"
                  className="btn btn-primary toolbar-btn-action download-btn"
                  onClick={(e) => {
                    if (!customPdfUrl) {
                      e.preventDefault();
                      alert("This is a high-fidelity visual PDF simulation. Upload a custom PDF to enable real downloads!");
                    }
                  }}
                >
                  Download PDF
                </a>
              </div>
            </div>
          </div>

          {/* PDF Viewer Sheet Box */}
          <div className="pdf-sheet-viewer-box">
            <div className="pdf-sheet-scroll" style={{ transform: `scale(${pdfZoom / 100})`, transformOrigin: 'top center' }}>
              
              {customPdfUrl ? (
                /* Real PDF View (If uploaded) */
                <iframe 
                  src={customPdfUrl} 
                  title="Uploaded PDF View" 
                  width="100%" 
                  height="750px" 
                  style={{ border: 'none', background: '#fff' }}
                />
              ) : (
                /* High-Fidelity Scanned PDF Simulator (Mirrors Screenshots) */
                <div className="scanned-pdf-page">
                  {pdfPage === 1 && (
                    /* Page 1 replica: EXHIBIT 2 Preamble cover */
                    <div className="pdf-canvas-replica page-cover">
                      <div className="top-citation">EXHIBIT 2</div>
                      <div className="main-title">Declaration</div>
                      
                      {/* Handwriting replica */}
                      <div className="handwriting-text font-script">
                        First Amendment 11/17/2008
                      </div>
                      
                      <div className="page-footer-citation">
                        <span className="left-code">MO2271377.4</span>
                        <span className="page-num">26</span>
                      </div>
                    </div>
                  )}

                  {pdfPage === 2 && (
                    /* Page 2 replica: Real Monongalia County Court Recording Header */
                    <div className="pdf-canvas-replica page-legal">
                      {/* Top Recording Stamps Bar */}
                      <div className="scanned-stamps-bar">
                        <div className="stamp-left">
                          <strong>VOL 1374 PAGE 342</strong>
                          <div className="handwritten-ink">1374-342</div>
                        </div>
                        <div className="stamp-mid">
                          <strong>STEPTOE & JOHNSON</strong>
                          <div>PO BOX 1616</div>
                          <div>MORGANTOWN, WV 26507-1616</div>
                        </div>
                        <div className="stamp-right border-stamp">
                          <strong>CARYE L. BLANEY</strong>
                          <div>MONONGALIA County 01:30:52 PM</div>
                          <div>Instrument No 298971</div>
                          <div>Date Recorded 10/14/2008</div>
                          <div>Document Type COV</div>
                          <div>Recording Fee $36.00</div>
                          <div>Additional $9.00</div>
                        </div>
                      </div>

                      {/* Declaration Heading */}
                      <div className="legal-title-header">
                        THE SUMMIT AT CHEAT LAKE<br />
                        DECLARATION
                      </div>

                      <div className="legal-body-text">
                        <p>
                          <strong>THIS DECLARATION</strong> is made and entered into this 3<sup>rd</sup> day of October, 2008, by 
                          <strong> The Summit at Cheat Lake, LLC</strong>, a West Virginia limited liability company ("Declarant").
                        </p>
                        
                        <p>
                          <strong>WHEREAS</strong>, Declarant owns and holds title to certain real property located and situate in Union 
                          District, Monongalia County, West Virginia, which Declarant intends to develop into a planned community; and
                        </p>

                        <p>
                          <strong>WHEREAS</strong>, Declarant intends to subject such property to the conditions, covenants, restrictions, 
                          exceptions, reservations, easements, rights of way, and limitations set forth and contained in this Declaration, 
                          each and all of which shall apply to, be binding upon, and inure to the benefit of Declarant, Address Owners, the 
                          Association, their successors and assigns, and any and all other parties having an interest in such property.
                        </p>

                        <p className="witnesseth">
                          <strong>NOW, THEREFORE, WITNESSETH:</strong> Declarant hereby declares that the Property is and shall be held, 
                          transferred, sold, granted, conveyed, leased and occupied subject to the conditions, covenants, restrictions, 
                          exceptions, reservations, easements, rights of way, and limitations set forth and contained in this Declaration.
                        </p>

                        <div className="article-title">Article I</div>
                        <div className="article-subtitle">THE ACT</div>
                        <p>
                          <strong>1.01. Applicability of the Act:</strong> Declarant hereby subjects and submits the Property, as a planned 
                          community, to the terms and provisions of the Act.
                        </p>
                      </div>

                      <div className="page-footer-citation">
                        <span className="left-code">MO2271541.5</span>
                        <span className="page-num">1</span>
                      </div>
                    </div>
                  )}

                  {pdfPage === 3 && (
                    /* Page 3 replica: Definitions and Bylaws citation */
                    <div className="pdf-canvas-replica page-legal">
                      <div className="scanned-stamps-bar pt-stamp">
                        <div className="stamp-left">
                          <strong>VOL 1374 PAGE 343</strong>
                        </div>
                      </div>

                      <div className="legal-body-text">
                        <p>
                          <strong>2.04. Association:</strong> The Summit at Cheat Lake Property Owners' Association, Inc., a non-profit corporation, 
                          organized under the laws of the State of West Virginia, and any wholly-owned subsidiary thereof, its successors and assigns.
                        </p>

                        <p>
                          <strong>2.05. Board:</strong> The board of directors of the Association.
                        </p>

                        <p className="highlight-row">
                          <strong>2.06. Bylaws:</strong> The bylaws of the Association and any and all amendments and modifications thereof and supplements thereto.
                        </p>

                        <p>
                          <strong>2.07. Clerk's Office:</strong> The Office of the Clerk of the County Commission of Monongalia County, West Virginia.
                        </p>

                        <p>
                          <strong>2.08. Common Elements:</strong> All areas on the Plat labeled "Common Areas", all streets, roads, easements, rights of way 
                          (including easements and rights of way over the Addresses, as shown on the Plat), rights, privileges, benefits, and interests appurtenant 
                          thereto, and improvements and permanent fixtures now or hereafter located and situated on the Property...
                        </p>

                        <p>
                          <strong>2.09. Common Expenses:</strong> Expenditures made by, or financial liabilities of, the Association, together with any allocations to reserves.
                        </p>

                        <p>
                          <strong>2.10. Common Expense Liabilities:</strong> The liability for Common Expenses allocated each year.
                        </p>
                      </div>

                      <div className="page-footer-citation">
                        <span className="left-code">MO2271541.5</span>
                        <span className="page-num">2</span>
                      </div>
                    </div>
                  )}

                  {pdfPage === 4 && (
                    /* Page 4 replica: First Amendment Cover with stamps */
                    <div className="pdf-canvas-replica page-legal">
                      <div className="scanned-stamps-bar">
                        <div className="stamp-left">
                          <strong>VOL 1376 PAGE 416</strong>
                          <div className="handwritten-ink">1376-416</div>
                        </div>
                        <div className="stamp-mid">
                          <strong>STEPTOE & JOHNSON</strong>
                          <div>PO BOX 1616</div>
                        </div>
                        <div className="stamp-right border-stamp">
                          <strong>CARYE L. BLANEY</strong>
                          <div>MONONGALIA County 02:12:44 PM</div>
                          <div>Instrument No 302766</div>
                          <div>Date Recorded 11/18/2008</div>
                          <div>Document Type COV</div>
                          <div>Recording Fee $5.00</div>
                          <div>Additional $6.00</div>
                        </div>
                      </div>

                      <div className="legal-title-header font-bold">
                        FIRST AMENDMENT TO<br />
                        THE SUMMIT AT CHEAT LAKE DECLARATION
                      </div>

                      <div className="legal-body-text">
                        <p>
                          This First Amendment to The Summit at Cheat Lake Declaration ("First Amendment") is made and entered into this 
                          <strong> 17<sup>th</sup> day of November, 2008</strong>, by <strong>The Summit at Cheat Lake, LLC</strong>, a 
                          West Virginia limited liability company ("Declarant").
                        </p>

                        <div className="article-title text-uppercase font-bold">Recitals</div>
                        <p>
                          <strong>1.</strong> By The Summit at Cheat Lake Declaration dated October 3, 2008, recorded in the office of the Clerk of the 
                          County Commission of Monongalia County, West Virginia, in Deed Book 1374, at Page 342 ("Declaration"), Declarant created and established 
                          The Summit at Cheat Lake, a planned community ("Community").
                        </p>

                        <p>
                          <strong>4.</strong> Pursuant to Paragraph 6.01 of the Declaration, Declarant desires to amend the Declaration to include the Phase I Plats 
                          into the terms and conditions and include Phase II of the Community, which shall consist of Addresses 42 to 89, inclusive, together with 
                          all related Common Elements, as shown on a Plat dated November 13, 2008, and of record in said Clerk's Office in Map Cabinet 5, Envelope 51A.
                        </p>
                      </div>

                      <div className="page-footer-citation">
                        <span className="left-code">S&J 5005108</span>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>
        </div>
      )}

      <style>{`
        .bylaws-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.5rem;
        }

        /* Explorer layout */
        .explorer-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 2rem;
          align-items: start;
        }

        @media (max-width: 968px) {
          .explorer-layout {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        .explorer-sidebar {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .bylaws-search {
          padding-left: 2.5rem !important;
        }

        .toc-list h3 {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
        }

        .toc-item {
          display: block;
          width: 100%;
          text-align: left;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 0.65rem 0.85rem;
          border-radius: var(--border-radius-sm);
          font-size: 0.925rem;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .toc-item:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.02);
        }

        .toc-item.active {
          background: var(--accent-primary-glow);
          color: var(--accent-primary);
          font-weight: 600;
          border-left: 3px solid var(--accent-primary);
          border-radius: 0 var(--border-radius-sm) var(--border-radius-sm) 0;
        }

        /* Explorer content display */
        .explorer-content-panel {
          min-height: 500px;
        }

        .article-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .doc-cite {
          font-size: 0.775rem;
          color: var(--text-muted);
          font-family: monospace;
        }

        .article-reading-mode h2 {
          font-size: 1.6rem;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.75rem;
        }

        .article-body-text p {
          margin-bottom: 1.25rem;
          line-height: 1.7;
          color: var(--text-secondary);
          white-space: pre-line;
        }

        /* Search result styling */
        .search-results-mode h2 {
          font-size: 1.25rem;
          margin-bottom: 1.25rem;
        }

        .results-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .search-result-card {
          cursor: pointer;
        }

        .search-result-card h3 {
          font-size: 1.05rem;
          margin-bottom: 0.5rem;
          color: var(--accent-primary);
        }

        .search-result-card .snippet {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
        }

        .go-to-link {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .search-result-card:hover .go-to-link {
          color: var(--text-primary);
          text-decoration: underline;
        }

        .empty-results {
          text-align: center;
          padding: 3rem;
          color: var(--text-muted);
          font-style: italic;
        }

        /* PDF Viewer toolbar styling */
        .pdf-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid var(--border-color);
          padding: 0.75rem 1.25rem;
          border-radius: var(--border-radius-sm) var(--border-radius-sm) 0 0;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .toolbar-left, .toolbar-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .toolbar-doc-title {
          font-family: monospace;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .divider {
          color: var(--border-color);
        }

        .page-selectors, .zoom-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .page-indicator, .zoom-level {
          font-size: 0.85rem;
          color: var(--text-primary);
          font-weight: 500;
          min-width: 80px;
          text-align: center;
        }

        .toolbar-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 0.3rem 0.65rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: var(--transition-fast);
        }

        .toolbar-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--border-color-hover);
        }

        .toolbar-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .toolbar-btn-action {
          min-height: 36px !important;
          padding: 0.4rem 0.85rem !important;
          font-size: 0.8rem !important;
        }

        .file-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .upload-label-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0;
          cursor: pointer;
        }

        /* Scanned Sheet PDF Simulation Styles */
        .pdf-sheet-viewer-box {
          background: #1e293b;
          border: 1px solid var(--border-color);
          border-top: none;
          padding: 2rem;
          min-height: 800px;
          display: flex;
          justify-content: center;
          overflow: auto;
          box-shadow: inset 0 4px 20px rgba(0,0,0,0.6);
        }

        .pdf-sheet-scroll {
          transition: transform 0.2s ease;
        }

        .scanned-pdf-page {
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        /* Custom Styles for the Scanned Page Canvas */
        .pdf-canvas-replica {
          width: 612px; /* Letter width * 0.72 scale approx */
          height: 792px; /* Letter height */
          background-color: #fbfbf8; /* Aged paper white */
          border: 1px solid #cbd5e1;
          color: #0f172a; /* Ink dark grey */
          padding: 3rem 2.5rem;
          box-sizing: border-box;
          position: relative;
          font-family: 'Times New Roman', Times, serif;
          line-height: 1.45;
          text-align: justify;
        }

        .pdf-canvas-replica * {
          text-shadow: 0.3px 0.3px 0px rgba(0,0,0,0.1); /* scanned ink bleed style */
        }

        /* Page cover specific */
        .page-cover {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .top-citation {
          font-size: 1.3rem;
          font-weight: bold;
          margin-bottom: 2rem;
          letter-spacing: 0.05em;
        }

        .page-cover .main-title {
          font-size: 2.2rem;
          font-weight: 500;
          margin-bottom: 8rem;
        }

        .handwriting-text {
          font-family: 'Brush Script MT', cursive, sans-serif;
          font-size: 2rem;
          color: #1e3a8a; /* Blue ballpen ink color */
          transform: rotate(-3deg);
          border-bottom: 1.5px solid #1e3a8a;
          padding: 0.25rem 1.5rem;
          margin-bottom: 2rem;
        }

        /* Scanned stamp bar */
        .scanned-stamps-bar {
          display: grid;
          grid-template-columns: 1.2fr 1.2fr 1.6fr;
          border-bottom: 1.5px solid #334155;
          padding-bottom: 0.75rem;
          margin-bottom: 1.5rem;
          font-size: 0.65rem;
          line-height: 1.2;
          font-family: 'Courier New', Courier, monospace;
        }

        .scanned-stamps-bar.pt-stamp {
          grid-template-columns: 1fr;
          border-bottom: none;
        }

        .stamp-left {
          position: relative;
        }

        .handwritten-ink {
          font-family: 'Brush Script MT', cursive, sans-serif;
          font-size: 1.5rem;
          color: #1e3a8a;
          transform: rotate(-10deg) translate(5px, 8px);
          position: absolute;
          opacity: 0.85;
        }

        .border-stamp {
          border: 1.5px solid #dc2626; /* Red ink stamp */
          color: #b91c1c;
          padding: 0.35rem;
          font-weight: bold;
          transform: rotate(0.5deg);
        }

        .legal-title-header {
          font-size: 1.15rem;
          font-weight: bold;
          text-align: center;
          margin-bottom: 1.5rem;
          line-height: 1.3;
          letter-spacing: 0.02em;
        }

        .legal-body-text p {
          text-indent: 2.5rem;
          margin-bottom: 0.85rem;
          font-size: 0.825rem;
        }

        .legal-body-text p.witnesseth {
          text-indent: 0;
          margin-top: 1.25rem;
          margin-bottom: 1.25rem;
        }

        .article-title {
          font-weight: bold;
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.9rem;
        }

        .article-subtitle {
          font-weight: bold;
          text-align: center;
          margin-bottom: 0.75rem;
          font-size: 0.85rem;
        }

        .highlight-row {
          background-color: rgba(254, 240, 138, 0.4); /* yellow marker highlight simulation */
          padding: 0.15rem 0;
        }

        .page-footer-citation {
          position: absolute;
          bottom: 1.5rem;
          left: 2.5rem;
          right: 2.5rem;
          display: flex;
          justify-content: space-between;
          font-size: 0.65rem;
          font-family: monospace;
          color: #475569;
          border-top: 1px solid #e2e8f0;
          padding-top: 0.5rem;
        }
      `}</style>
    </div>
  );
}
