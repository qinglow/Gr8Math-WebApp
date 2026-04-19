'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Gr8MathHeader } from '@/components/ui/Gr8MathHeader';

export default function PrivacyPolicyPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#E2E7E9] font-sans flex flex-col">
            <Gr8MathHeader />

            <main className="flex-1 w-full max-w-[1000px] mx-auto px-6 py-10 animate-in fade-in duration-500">
                <div className="flex items-center gap-3 mb-8">
                    <button 
                    aria-label='ded'
                        onClick={() => router.back()} 
                        className="p-1 -ml-1 text-[#0A7F93] hover:bg-black/5 rounded-lg transition-colors outline-none cursor-pointer"
                    >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                    <h1 className="text-[20px] md:text-[22px] font-bold text-[#222] m-0">
                        Privacy Policy
                    </h1>
                </div>

                <div className="bg-white border border-[#D1D8DD] rounded-xl shadow-sm px-8 py-12 md:px-16 md:py-16 mb-20">
                    <h2 className="text-3xl md:text-4xl font-black text-center text-[#222] mb-4 leading-tight">
                        Gr8 Math Learning Management System
                        Privacy Policy
                    </h2>
                    <p className="text-center text-[#888] font-medium mb-12">Effective Date: Dec. 2, 2025</p>

                    <section className="text-[#222]">
                        <p className="text-[15px] leading-relaxed text-[#444] mb-4 font-semibold">
                            Color Rush Studios (the "Company" or "PIC") is committed to protecting your Personal Data in compliance with the Philippine DPA of 2012. This Privacy Policy explains how Color Rush Studios, acting as the Personal Information Controller (PIC), collects, uses, protects, and handles your Personal Data in compliance with the Republic Act No. 10173, otherwise known as the Data Privacy Act of 2012 (DPA), and its Implementing Rules and Regulations (IRR).
                        </p>
                        
                        <p className="text-[15px] leading-relaxed text-[#444] mb-8">
                            Note on Format (Layered Notice Requirement): In presenting information to you, we adopt the layered privacy notice approach, which provides key information upfront and directs you to more detailed descriptions, often using hyperlinks. For electronic processing, where the format may be limited, a link to this comprehensive notice is always readily available.
                        </p>

                        <h3 className="text-[20px] font-bold text-[#1A4C8B] mt-8 mb-4 border-b pb-2">Summary of Data Processing</h3>
                        <div className="overflow-x-auto mb-8">
                            <table className="min-w-full text-left border-collapse border border-[#D1D8DD] text-[14px]">
                                <thead>
                                    <tr className="bg-[#E9EEF0]">
                                        <th className="border border-[#D1D8DD] p-3 w-1/3">Category</th>
                                        <th className="border border-[#D1D8DD] p-3">Summary of Data Processing</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border border-[#D1D8DD] p-3 font-semibold">What Data We Collect & Why We Collect It</td>
                                        <td className="border border-[#D1D8DD] p-3">We collect your Identity Data (including Full Name, Email, and Learner Reference Number - LRN), Professional Data (e.g., Teaching Achievements), and User Content (assignments, quizzes, lesson logs) to run the Gr8 Math platform. To provide the core LMS services and fulfill our contract with you (Service Provision). We use the data to monitor usage and improve the platform (Legitimate Interest). Direct Marketing requires your separate, specific consent.</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-[#D1D8DD] p-3 font-semibold">Consent for Minors</td>
                                        <td className="border border-[#D1D8DD] p-3">If the user is under 18 years old, we require the verifiable consent of a Parent/Guardian before processing the Minor User's personal data.</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-[#D1D8DD] p-3 font-semibold">How Long We Keep It</td>
                                        <td className="border border-[#D1D8DD] p-3">Data is kept only as long as necessary. Key account data is archived for an audit period of three (3) years following account closure, and consent records are retained for ten (10) years.</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-[#D1D8DD] p-3 font-semibold">Your Rights</td>
                                        <td className="border border-[#D1D8DD] p-3">You have the Right to Access, Right to Correction/Rectification, Right to Object (to processing), and the Right to Erasure (Right to be Forgotten).</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-[#D1D8DD] p-3 font-semibold">Contact for Inquiries</td>
                                        <td className="border border-[#D1D8DD] p-3">For questions or to exercise your rights, please contact our Data Protection Officer: Hannah Mae Reyes at dpo@colorrush.com.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-[15px] font-bold text-[#1A4C8B] mb-8">By proceeding, you consent to this processing.</p>

                        <h3 className="text-[20px] font-bold text-[#1A4C8B] mt-8 mb-4 border-b pb-2">I. Identity of the Personal Information Controller (PIC) and Contact Details</h3>
                        <ul className="list-disc pl-6 mb-6 text-[15px] text-[#444] space-y-2">
                            <li><strong>Personal Information Controller (PIC) / Organization:</strong> Color Rush Studios</li>
                            <li><strong>Business Address:</strong> Color Rush Building, 17th Ave., Fort Bonifacio, Taguig City</li>
                            <li><strong>Contact Number / Official Email:</strong> 09*********/main@colorrush.com</li>
                            <li><strong>Data Protection Officer (DPO):</strong> Name: Hannah Mae Reyes | Contact Details: dpo@colorrush.com</li>
                        </ul>

                        <h3 className="text-[20px] font-bold text-[#1A4C8B] mt-8 mb-4 border-b pb-2">II. Personal Data Collected</h3>
                        <p className="text-[15px] leading-relaxed text-[#444] mb-4">We collect Personal Data that is adequate, relevant, suitable, necessary, and not excessive in relation to our declared purpose, upholding the principle of Proportionality.</p>
                        <ol className="list-decimal pl-6 mb-6 text-[15px] text-[#444] space-y-2">
                            <li><strong>Identity Data:</strong> Full Name, Date of Birth, Gender, Learner's Reference Number</li>
                            <li><strong>Contact Data:</strong> Email Address, Phone Number.</li>
                            <li><strong>Technical Data/Usage Data:</strong> IP address, device type, operating system, usage logs, browser type.</li>
                            <li><strong>User Content:</strong> Assignments, quizzes, daily lesson logs, lessons, and other similar educational materials submitted by Clients for the purpose of instruction, assessment, and record-keeping on the Gr8 Math platform.</li>
                            <li><strong>Minor User Data:</strong> For users below 18, we require the verifiable consent of the Parent/Guardian to process the Minor User's personal data, in compliance with R.A. 10173.</li>
                        </ol>

                        <h3 className="text-[20px] font-bold text-[#1A4C8B] mt-8 mb-4 border-b pb-2">III. Purposes and Legal Basis for Processing</h3>
                        <div className="overflow-x-auto mb-8">
                            <table className="min-w-full text-left border-collapse border border-[#D1D8DD] text-[14px]">
                                <thead>
                                    <tr className="bg-[#E9EEF0]">
                                        <th className="border border-[#D1D8DD] p-3">Purpose of Processing</th>
                                        <th className="border border-[#D1D8DD] p-3">Description/Scope of Processing</th>
                                        <th className="border border-[#D1D8DD] p-3">Legal Basis (DPA Section)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border border-[#D1D8DD] p-3 font-semibold">Service Provision / Contract Fulfillment</td>
                                        <td className="border border-[#D1D8DD] p-3">To register your account, manage access, process transactions, and provide the core functions (LMS/courseware) of Gr8 Math</td>
                                        <td className="border border-[#D1D8DD] p-3">Contractual Obligation (Sec. 21(b)) or Consent (Sec. 21(a))</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-[#D1D8DD] p-3 font-semibold">Product Improvement / Data Analytics</td>
                                        <td className="border border-[#D1D8DD] p-3">To monitor usage, conduct statistical research, analyze trends, and improve the user experience.</td>
                                        <td className="border border-[#D1D8DD] p-3">Legitimate Interest (Sec. 21(g)) or Consent (Sec. 21(a))</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-[#D1D8DD] p-3 font-semibold">Direct Marketing</td>
                                        <td className="border border-[#D1D8DD] p-3">To send promotional materials, special offers, and tailored advertisements.</td>
                                        <td className="border border-[#D1D8DD] p-3">Specific and Informed Consent (Sec. 21(a))</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-[#D1D8DD] p-3 font-semibold">Compliance and Security</td>
                                        <td className="border border-[#D1D8DD] p-3">To respond to legal obligations, detect fraud, enforce our Terms and Conditions, and manage personal data breaches.</td>
                                        <td className="border border-[#D1D8DD] p-3">Legal Obligation (Sec. 21(c)) or Public Safety (Sec. 21(e))</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <h3 className="text-[20px] font-bold text-[#1A4C8B] mt-8 mb-4 border-b pb-2">IV. Data Subject Rights and Consent Mechanisms</h3>
                        <h4 className="text-[17px] font-semibold mt-6 mb-2">A. Data Subject Rights (Rule VIII)</h4>
                        <p className="text-[15px] leading-relaxed text-[#444] mb-4">As a Data Subject, you are entitled to exercise your rights under the DPA:</p>
                        <ol className="list-decimal pl-6 mb-6 text-[15px] text-[#444] space-y-2">
                            <li><strong>Right to be Informed:</strong> You have the right to be informed whether your personal data is being processed, including profiling and automated decision-making. We must furnish you with all information contained in this policy (identity of PIC, purposes, recipients, retention period, etc.).</li>
                            <li><strong>Right to Object:</strong> You have the right to object to the processing of your personal data, including processing for direct marketing, automated processing, or profiling. When you object, we shall stop processing the data unless the processing is pursuant to a subpoena, necessary for a contract/service, or a legal obligation.</li>
                            <li><strong>Right to Access:</strong> You have the right to reasonable access, upon demand, to the contents of your processed data, the sources from which the data was obtained, the recipients, the manner of processing, and information regarding automated processes.</li>
                            <li><strong>Right to Rectification/Correction:</strong> You have the right to dispute the inaccuracy or error in your personal data and have the PIC correct it immediately.</li>
                            <li><strong>Right to Erasure or Blocking:</strong> You have the right to suspend, withdraw, or order the blocking, removal, or destruction of your personal data when, for example, the data is incomplete, unlawfully obtained, or no longer necessary for the purpose of collection, or you withdraw consent and there is no other legal basis for processing.</li>
                            <li><strong>Right to Data Portability:</strong> Where your data is processed by electronic means and in a structured format, you have the right to obtain a copy of such data in a format that allows for further use.</li>
                            <li><strong>Right to Damages:</strong> You shall be indemnified for damages sustained due to inaccurate, incomplete, or unauthorized use of personal data.</li>
                        </ol>

                        <h4 className="text-[17px] font-semibold mt-6 mb-2">B. Mechanism for Obtaining Valid Consent</h4>
                        <p className="text-[15px] leading-relaxed text-[#444] mb-2">Consent is a specific, informed indication of will and must be evidenced by written, electronic, or recorded means.</p>
                        <ul className="list-disc pl-6 mb-6 text-[15px] text-[#444] space-y-2">
                            <li><strong>No Implied Consent:</strong> Implied or inferred consent is generally prohibited.</li>
                            <li><strong>Clear Assenting Action:</strong> Consent must be given through a clear assenting action, such as clicking a dedicated button. Silence or pre-ticked boxes do not constitute consent. Granularity: If the data is processed for multiple unrelated purposes (e.g., service provision, and separately, for direct marketing), consent must be given specifically for each purpose.</li>
                        </ul>

                        <h4 className="text-[17px] font-semibold mt-6 mb-2">C. Withdrawal of Consent</h4>
                        <p className="text-[15px] leading-relaxed text-[#444] mb-2">Consent can be withdrawn at any time.</p>
                        <ul className="list-disc pl-6 mb-6 text-[15px] text-[#444] space-y-2">
                            <li><strong>Ease of Withdrawal:</strong> Withdrawing consent must be as easy as, if not easier than, giving consent.</li>
                            <li><strong>Interface:</strong> If a service-specific user interface (like a log-in account) was used to obtain consent, that same interface should be used for withdrawing consent.</li>
                            <li><strong>Consequences:</strong> Upon withdrawal, we are obliged to implement procedures to suspend, withdraw, or order the blocking, removal, or destruction of your personal data from our systems.</li>
                        </ul>

                        <h3 className="text-[20px] font-bold text-[#1A4C8B] mt-8 mb-4 border-b pb-2">VI. Data Retention and Disposal</h3>
                        <p className="text-[15px] leading-relaxed text-[#444] mb-4">You must adhere to the principle that Personal Data shall not be retained longer than necessary.</p>
                        <ol className="list-decimal pl-6 mb-6 text-[15px] text-[#444] space-y-2">
                            <li><strong>Retention Period:</strong> Personal Data is retained only for the period necessary to fulfill the purpose for which it was collected, or as required by law. Specifically:
                                <ul className="list-[lower-alpha] pl-6 mt-2 space-y-2">
                                    <li>Active Account Data: Retained for the duration the user maintains an active Gr8 Math account.</li>
                                    <li>Post-Closure Data: Key Identity and User Content data will be archived for an audit period of three (3) years following account closure, after which it will be securely disposed of.</li>
                                    <li>Consent and Transaction Records: Retained for ten (10) years after the last activity, to comply with Philippine statutes of limitations for contractual claims.</li>
                                </ul>
                            </li>
                            <li><strong>Disposal:</strong> Upon termination of the processing, personal data will be disposed of or discarded in a secure manner that prevents further processing, unauthorized access, or disclosure.</li>
                        </ol>

                        <h3 className="text-[20px] font-bold text-[#1A4C8B] mt-8 mb-4 border-b pb-2">VII. Security Measures and Breach Notification</h3>
                        <p className="text-[15px] leading-relaxed text-[#444] mb-4">We implement reasonable and appropriate organizational, physical, and technical security measures to maintain the availability, integrity, and confidentiality of your personal data against accidental or unlawful destruction, alteration, and disclosure.</p>
                        <p className="text-[15px] leading-relaxed text-[#444] mb-2">Technical measures include:</p>
                        <ul className="list-disc pl-6 mb-4 text-[15px] text-[#444] space-y-2">
                            <li>Encryption of personal data during storage and while in transit. Authentication processes.</li>
                            <li>Regular monitoring for security breaches and testing/evaluation of security effectiveness.</li>
                        </ul>
                        <p className="text-[15px] leading-relaxed text-[#444] mb-6">
                            <strong>Personal Data Breach Notification:</strong> In the event of a personal data breach, we shall notify the National Privacy Commission and the affected Data Subjects within seventy-two (72) hours upon knowledge that a breach requiring notification has occurred. Notification is required if sensitive personal information or information enabling identity fraud is acquired by an unauthorized person, and this acquisition is likely to give rise to a real risk of serious harm to you.
                        </p>

                        <h3 className="text-[20px] font-bold text-[#1A4C8B] mt-8 mb-4 border-b pb-2">VIII. Updates to this Policy</h3>
                        <p className="text-[15px] leading-relaxed text-[#444] mb-4">
                            We may update this Privacy Policy from time to time. Any changes will be effective immediately upon posting the revised Policy. We will notify you of any substantial changes, and if the processing purpose changes, you will be given the opportunity to withhold consent.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}