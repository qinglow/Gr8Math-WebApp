'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Gr8MathHeader } from '@/components/ui/Gr8MathHeader';

export default function TermsAndConditionsPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#E2E7E9] font-sans flex flex-col">
            <Gr8MathHeader />

            <main className="flex-1 w-full max-w-[1000px] mx-auto px-6 py-10 animate-in fade-in duration-500">
                <div className="flex items-center gap-3 mb-8">
                    <button 
                        aria-label='de'
                        onClick={() => router.back()} 
                        className="p-1 -ml-1 text-[#0A7F93] hover:bg-black/5 rounded-lg transition-colors outline-none cursor-pointer"
                    >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                    <h1 className="text-[20px] md:text-[22px] font-bold text-[#222] m-0">
                        Terms and Conditions
                    </h1>
                </div>

                <div className="bg-white border border-[#D1D8DD] rounded-xl shadow-sm px-8 py-12 md:px-16 md:py-16 mb-20">
                    <h2 className="text-3xl md:text-4xl font-black text-center text-[#222] mb-4 leading-tight">
                        Gr8 Math Learning Management System
                        Terms and Conditions
                    </h2>
                    <p className="text-center text-[#888] font-medium mb-12">Last Updated: Dec 2, 2025</p>

                    <section className="text-[#222]">
                        <p className="text-[15px] leading-relaxed text-[#444] mb-5 font-semibold">
                            Important Notice: This General Terms and Conditions document (referred to herein as "T&Cs" or "Terms") is a legal agreement between you ("Client" or "User") and Color Rush Studios, operating the learning management system/service Gr8 Math (the "Company" or "We").
                        </p>
                        <p className="text-[15px] leading-relaxed text-[#444] mb-8">
                            By checking the box and proceeding with the registration or login, or otherwise accessing or using the Service, you confirm that you have read, understood, and irrevocably agreed to be bound by these T&Cs and the separate Privacy Policy.
                        </p>

                        <h3 className="text-[20px] font-bold text-[#1A4C8B] mt-8 mb-4 border-b pb-2">1. Definitions and Scope</h3>
                        
                        <h4 className="text-[17px] font-semibold mt-6 mb-2">1.1. Introduction and Scope</h4>
                        <p className="text-[15px] leading-relaxed text-[#444] mb-4">
                            These T&Cs set out the general terms and conditions applicable to your use of the Gr8 Math mobile application, and all related services, content, and materials (the "Service").
                        </p>

                        <h4 className="text-[17px] font-semibold mt-6 mb-2">1.2. Key Definitions</h4>
                        <p className="text-[15px] leading-relaxed text-[#444] mb-2">For clarity, capitalized terms used in this document have the following meanings:</p>
                        <ul className="list-disc pl-6 mb-6 text-[15px] text-[#444] space-y-2">
                            <li><strong>Applicable Laws:</strong> shall mean all laws and regulations in the Philippines that are applicable to the transactions between the Client and the Company.</li>
                            <li><strong>Electronic Signatures:</strong> refer to the required electronic signature, One-Time Password ("OTP"), and other identification factors used for verification.</li>
                            <li><strong>Personal Data:</strong> refers to all types of personal information and sensitive personal information collected and processed.</li>
                            <li><strong>User Content:</strong> means any content, including comments, messages, assignments, or images, contributed by the Client to the Service.</li>
                            <li><strong>Minor User:</strong> refers to any individual using the Service who is below eighteen (18) years of age and, as such, is not yet of legal age to enter into a binding contract under the laws of the Republic of the Philippines.</li>
                            <li><strong>Parent/Guardian:</strong> refers to a legally authorized adult who provides verifiable consent for a Minor User to access and use the Service and assumes responsibility for the Minor User's compliance with these T&Cs.</li>
                        </ul>

                        <h3 className="text-[20px] font-bold text-[#1A4C8B] mt-8 mb-4 border-b pb-2">2. Access and Use of the Service</h3>
                        
                        <h4 className="text-[17px] font-semibold mt-6 mb-2">2.1. Eligibility and Parental Consent</h4>
                        <p className="text-[15px] leading-relaxed text-[#444] mb-4">
                            The Service is intended for use by individuals who are 18 years of age or older ("Adult User"). If you are below 18 years of age (a "Minor User"), you may only use the Service if: a) You have the express permission and supervision of a parent or legal guardian; AND b) Your parent or legal guardian reads, understands, and agrees to these T&Cs on your behalf. Your use of the Service is deemed ratification by your parent or legal guardian of these Terms and Conditions.
                        </p>

                        <h4 className="text-[17px] font-semibold mt-6 mb-2">2.2. Account Creation and Maintenance</h4>
                        <p className="text-[15px] leading-relaxed text-[#444] mb-2">
                            To use the Service, you must create an account ("Account"). You must provide accurate and current information, including your email and mobile number.
                        </p>
                        <ol className="list-decimal pl-6 mb-6 text-[15px] text-[#444] space-y-2">
                            <li><strong>Client Responsibility:</strong> You are responsible for maintaining the confidentiality of your credentials (username, passwords, OTPs) and are solely liable for all activities that occur under your Account. You agree to hold the Company harmless from any losses, damages, or claims that may result from the wrongful use of the Electronic Signatures, provided the Company is not at fault or negligent.</li>
                            <li><strong>Notification of Changes:</strong> You must promptly notify the Company of any material change affecting your registered email or mobile number.</li>
                        </ol>

                        <h4 className="text-[17px] font-semibold mt-6 mb-2">2.3. User Conduct and Content Standards</h4>
                        <p className="text-[15px] leading-relaxed text-[#444] mb-4">
                            You agree to use the Service strictly for personal, non-commercial, educational purposes as intended. You agree not to use the Service to post or transmit content that is illegal, defamatory, obscene, abusive, invasive of privacy, or infringes on someone else's intellectual property rights. The Company reserves the right to remove any User Content that violates these T&Cs at its sole discretion, which may also result in suspending or terminating the user's account.
                        </p>

                        <h3 className="text-[20px] font-bold text-[#1A4C8B] mt-8 mb-4 border-b pb-2">3. Intellectual Property (IP) Rights and User Content</h3>
                        
                        <h4 className="text-[17px] font-semibold mt-6 mb-2">3.1. Company Ownership</h4>
                        <p className="text-[15px] leading-relaxed text-[#444] mb-4">
                            The Company owns all content and materials on the Service, including the courseware, code, graphics, design, software, copyrights, trademarks, and patents. IP protection is governed primarily by the Intellectual Property Code of the Philippines (Republic Act No. 8293).
                        </p>

                        <h4 className="text-[17px] font-semibold mt-6 mb-2">3.2. User License Grant</h4>
                        <p className="text-[15px] leading-relaxed text-[#444] mb-4">
                            The Company grants the Client a limited, non-exclusive, non-transferable, and revocable license to use the Service and view the content for personal, generally non-commercial purposes. You are prohibited from copying, reproducing, modifying, distributing, or creating derivative works based on the Company's content without explicit permission.
                        </p>

                        <h4 className="text-[17px] font-semibold mt-6 mb-2">3.3. User Content License</h4>
                        <p className="text-[15px] leading-relaxed text-[#444] mb-2">If you contribute User Content, you acknowledge that:</p>
                        <ol className="list-decimal pl-6 mb-6 text-[15px] text-[#444] space-y-2">
                            <li><strong>Responsibility:</strong> You are responsible for the content you post, including any legal consequences arising from claims of defamation or infringement.</li>
                            <li><strong>License to Company:</strong> You grant the Company a non-exclusive, royalty-free, sublicensable, and transferable license to use, display, reproduce, distribute, and exploit that User Content for the purpose of operating, promoting, and improving the Services.</li>
                        </ol>

                        <h3 className="text-[20px] font-bold text-[#1A4C8B] mt-8 mb-4 border-b pb-2">4. Privacy, Data Protection, and Communication</h3>
                        
                        <h4 className="text-[17px] font-semibold mt-6 mb-2">4.1. Privacy Policy Reference</h4>
                        <p className="text-[15px] leading-relaxed text-[#444] mb-4">
                            The Client (or the Parent/Guardian, in the case of a Minor User) explicitly consents to and confirms having read and understood the Company's separate Privacy Notice/Policy. This policy ensures compliance with the Philippines' Republic Act (R.A.) 10173 (Data Privacy Act of 2012). For Minor Users (under 18): The Company requires the verifiable consent of the Parent/Guardian to process the Minor User's personal data, in compliance with R.A. 10173.
                        </p>

                        <h4 className="text-[17px] font-semibold mt-6 mb-2">4.2. Electronic Communications</h4>
                        <p className="text-[15px] leading-relaxed text-[#444] mb-4">
                            The Client agrees that the Company may send communications, confirmations, and notices regarding the Service or changes to these T&Cs via "Alternative Communication Channels," including the Client's registered email or mobile number, website, or mobile application.
                        </p>

                        <h4 className="text-[17px] font-semibold mt-6 mb-2">4.3. Record of Transactions and Communications</h4>
                        <p className="text-[15px] leading-relaxed text-[#444] mb-4">
                            The Client authorizes the Company to record and store transaction details, system logs, and any communications related to the Service. The Company may use such records and logs as conclusive evidence of the Client's acceptance of terms, transactions, and for use in any judicial, administrative, or arbitration proceeding.
                        </p>

                        <h3 className="text-[20px] font-bold text-[#1A4C8B] mt-8 mb-4 border-b pb-2">5. Electronic Signatures and Validity</h3>
                        
                        <h4 className="text-[17px] font-semibold mt-6 mb-2">5.1. Binding Effect of Electronic Signatures</h4>
                        <p className="text-[15px] leading-relaxed text-[#444] mb-4">
                            The Client irrevocably and unconditionally accepts to be bound by all relevant contracts and documents upon the Client's submission of the valid and applicable OTP or other required identification factors (Electronic Signatures).
                        </p>

                        <h4 className="text-[17px] font-semibold mt-6 mb-2">5.2. Legal Recognition</h4>
                        <p className="text-[15px] leading-relaxed text-[#444] mb-4">
                            The Client hereby declares their intention to use the Electronic Signatures as their valid and binding electronic signatures as allowed by Philippines law (R.A. No. 8792, the Electronic Commerce Act of 2000). The Electronic Signatures shall bind the Client as though the same were duly signed in person with wet ink.
                        </p>

                        <h4 className="text-[17px] font-semibold mt-6 mb-2">5.3. Prohibition to Contest</h4>
                        <p className="text-[15px] leading-relaxed text-[#444] mb-6">
                            The Client shall not contest the validity or enforceability of any Communications, contracts, and transactions on the ground that they were electronically signed via the Electronic Signatures.
                        </p>

                        <h3 className="text-[20px] font-bold text-[#1A4C8B] mt-8 mb-4 border-b pb-2">6. Disclaimers, Liability, and Indemnification</h3>
                        
                        <h4 className="text-[17px] font-semibold mt-6 mb-2">6.1. No Warranty</h4>
                        <p className="text-[15px] leading-relaxed text-[#444] mb-4">
                            The Service is provided "as is". The Company makes no warranties or representations about the quality, reliability, availability, or functionality of the Service. The user uses the Service at their own risk.
                        </p>

                        <h4 className="text-[17px] font-semibold mt-6 mb-2">6.2. Limitation of Liability</h4>
                        <p className="text-[15px] leading-relaxed text-[#444] mb-4">
                            The Company restricts the types and amounts of damages that a user can claim from the service provider. However, the Client acknowledges that a waiver or limitation of liability for fraud and gross negligence is void under Philippine law.
                        </p>

                        <h4 className="text-[17px] font-semibold mt-6 mb-2">6.3. Indemnification</h4>
                        <p className="text-[15px] leading-relaxed text-[#444] mb-6">
                            The Client agrees to protect and hold the Company harmless against any claims, damages, losses, or expenses that arise from the Client's actions or violation of these T&Cs.
                        </p>

                        <h3 className="text-[20px] font-bold text-[#1A4C8B] mt-8 mb-4 border-b pb-2">7. Dispute Resolution and Governing Law</h3>
                        
                        <h4 className="text-[17px] font-semibold mt-6 mb-2">7.1. Governing Law</h4>
                        <p className="text-[15px] leading-relaxed text-[#444] mb-4">
                            The Applicable Agreement, Specific T&Cs, General T&Cs, and other documents shall be governed by the laws of the Republic of the Philippines.
                        </p>

                        <h4 className="text-[17px] font-semibold mt-6 mb-2">7.2. Exclusive Venue (Litigation)</h4>
                        <p className="text-[15px] leading-relaxed text-[#444] mb-4">
                            Any controversy or dispute that may arise between the Company and the Client shall be brought exclusively in the proper courts of the Philippines which have jurisdiction over the Company's registered principal place of business (i.e., the proper courts of Taguig City), to the exclusion of all other courts.
                        </p>

                        <h4 className="text-[17px] font-semibold mt-6 mb-2">7.3. Alternative Dispute Resolution (ADR)</h4>
                        <p className="text-[15px] leading-relaxed text-[#444] mb-6">
                            Any dispute, controversy, or claim arising out of or relating to these T&Cs shall be settled by binding arbitration. The arbitration agreement should state the number of arbitrators, the designated independent third party who shall appoint them, the procedure for appointment, and the period within which the arbitrator/s should be appointed. If the parties fail to agree on the place of arbitration, the venue shall be Metro Manila.
                        </p>

                        <h3 className="text-[20px] font-bold text-[#1A4C8B] mt-8 mb-4 border-b pb-2">8. Miscellaneous Provisions</h3>

                        <h4 className="text-[17px] font-semibold mt-6 mb-2">8.1. Updates and Amendments</h4>
                        <p className="text-[15px] leading-relaxed text-[#444] mb-4">
                            The Company reserves the right to update or amend these General T&Cs at any time. Such amendments shall bind the Client from the date such changes are published through the Company's website or via Alternative Communication Channels.
                        </p>

                        <h4 className="text-[17px] font-semibold mt-6 mb-2">8.2. Severability</h4>
                        <p className="text-[15px] leading-relaxed text-[#444] mb-4">
                            If any provision of these T&Cs is held to be invalid, illegal, or unenforceable, the invalidity shall not affect any other provisions, which shall be reformed, construed, and enforced to the fullest extent possible.
                        </p>

                        <h4 className="text-[17px] font-semibold mt-6 mb-2">8.3. Confirmation</h4>
                        <p className="text-[15px] leading-relaxed text-[#444] mb-4">
                            The Client confirms having read and understood the entire Applicable Agreement, Specific T&Cs, and General T&Cs, and that the same have been explained to the Client in the language understood by the Client.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}