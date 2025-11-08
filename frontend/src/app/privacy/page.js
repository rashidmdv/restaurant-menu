"use client";

import Footer from "../components/Footer";

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-[#fcf6e2]">
      {/* Header Section */}
      <div className="w-full bg-[#5c4a2b] py-16 lg:py-20 px-4 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-white font-bold text-[32px] md:text-[40px] lg:text-[48px] mb-4">
            Privacy Policy
          </h1>
          <p className="text-white/80 text-[15px] lg:text-[17px]">
            Last updated: January 8, 2025
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full py-16 lg:py-24 px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <section className="py-8 border-b border-[#5c4a2b]/10">
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
              ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
              aliquip ex ea commodo consequat.
            </p>
          </section>

          {/* Section 1 */}
          <section className="py-12 lg:py-16 border-b border-[#5c4a2b]/10">
            <h2 className="text-[#C67D30] font-bold text-[24px] lg:text-[28px] mb-6">
              1. Information We Collect
            </h2>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose mb-6">
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
              cupidatat non proident, sunt in culpa qui officia deserunt mollit
              anim id est laborum.
            </p>

            <h3 className="text-[#5c4a2b] font-semibold text-[18px] lg:text-[20px] mb-4 mt-8">
              1.1 Personal Information
            </h3>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose mb-4">
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem
              accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
              quae ab illo inventore veritatis et quasi architecto beatae vitae
              dicta sunt explicabo.
            </p>
            <ul className="space-y-3 mb-6">
              <li className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose flex items-start">
                <span className="text-[#C67D30] mr-3">•</span>
                <span>Full name and contact information</span>
              </li>
              <li className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose flex items-start">
                <span className="text-[#C67D30] mr-3">•</span>
                <span>Email address and phone number</span>
              </li>
              <li className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose flex items-start">
                <span className="text-[#C67D30] mr-3">•</span>
                <span>Reservation details and preferences</span>
              </li>
              <li className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose flex items-start">
                <span className="text-[#C67D30] mr-3">•</span>
                <span>Payment information (if applicable)</span>
              </li>
            </ul>

            <h3 className="text-[#5c4a2b] font-semibold text-[18px] lg:text-[20px] mb-4 mt-8">
              1.2 Automatically Collected Information
            </h3>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose">
              Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit
              aut fugit, sed quia consequuntur magni dolores eos qui ratione
              voluptatem sequi nesciunt.
            </p>
          </section>

          {/* Section 2 */}
          <section className="py-12 lg:py-16 border-b border-[#5c4a2b]/10">
            <h2 className="text-[#C67D30] font-bold text-[24px] lg:text-[28px] mb-6">
              2. How We Use Your Information
            </h2>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose mb-6">
              Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet,
              consectetur, adipisci velit, sed quia non numquam eius modi tempora
              incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
            </p>

            <h3 className="text-[#5c4a2b] font-semibold text-[18px] lg:text-[20px] mb-4 mt-8">
              2.1 Reservation Management
            </h3>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose mb-6">
              Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis
              suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.
            </p>

            <h3 className="text-[#5c4a2b] font-semibold text-[18px] lg:text-[20px] mb-4 mt-8">
              2.2 Communication
            </h3>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose">
              Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse
              quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat
              quo voluptas nulla pariatur.
            </p>
          </section>

          {/* Section 3 */}
          <section className="py-12 lg:py-16 border-b border-[#5c4a2b]/10">
            <h2 className="text-[#C67D30] font-bold text-[24px] lg:text-[28px] mb-6">
              3. Data Storage and Security
            </h2>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose mb-6">
              At vero eos et accusamus et iusto odio dignissimos ducimus qui
              blanditiis praesentium voluptatum deleniti atque corrupti quos
              dolores et quas molestias excepturi sint occaecati cupiditate non
              provident.
            </p>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose">
              Similique sunt in culpa qui officia deserunt mollitia animi, id est
              laborum et dolorum fuga. Et harum quidem rerum facilis est et
              expedita distinctio.
            </p>
          </section>

          {/* Section 4 */}
          <section className="py-12 lg:py-16 border-b border-[#5c4a2b]/10">
            <h2 className="text-[#C67D30] font-bold text-[24px] lg:text-[28px] mb-6">
              4. Cookies and Tracking Technologies
            </h2>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose mb-6">
              Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil
              impedit quo minus id quod maxime placeat facere possimus, omnis
              voluptas assumenda est, omnis dolor repellendus.
            </p>
            <ul className="space-y-3">
              <li className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose flex items-start">
                <span className="text-[#C67D30] mr-3">•</span>
                <span>Essential cookies for website functionality</span>
              </li>
              <li className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose flex items-start">
                <span className="text-[#C67D30] mr-3">•</span>
                <span>Analytics cookies to understand usage patterns</span>
              </li>
              <li className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose flex items-start">
                <span className="text-[#C67D30] mr-3">•</span>
                <span>Preference cookies to remember your settings</span>
              </li>
              <li className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose flex items-start">
                <span className="text-[#C67D30] mr-3">•</span>
                <span>Marketing cookies (with your consent)</span>
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="py-12 lg:py-16 border-b border-[#5c4a2b]/10">
            <h2 className="text-[#C67D30] font-bold text-[24px] lg:text-[28px] mb-6">
              5. Third-Party Services
            </h2>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose mb-6">
              Temporibus autem quibusdam et aut officiis debitis aut rerum
              necessitatibus saepe eveniet ut et voluptates repudiandae sint et
              molestiae non recusandae.
            </p>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose">
              Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis
              voluptatibus maiores alias consequatur aut perferendis doloribus
              asperiores repellat.
            </p>
          </section>

          {/* Section 6 */}
          <section className="py-12 lg:py-16 border-b border-[#5c4a2b]/10">
            <h2 className="text-[#C67D30] font-bold text-[24px] lg:text-[28px] mb-6">
              6. Your Rights
            </h2>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose mb-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <ul className="space-y-3">
              <li className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose flex items-start">
                <span className="text-[#C67D30] mr-3">•</span>
                <span>Right to access your personal data</span>
              </li>
              <li className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose flex items-start">
                <span className="text-[#C67D30] mr-3">•</span>
                <span>Right to rectification of inaccurate data</span>
              </li>
              <li className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose flex items-start">
                <span className="text-[#C67D30] mr-3">•</span>
                <span>Right to erasure (right to be forgotten)</span>
              </li>
              <li className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose flex items-start">
                <span className="text-[#C67D30] mr-3">•</span>
                <span>Right to restrict processing</span>
              </li>
              <li className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose flex items-start">
                <span className="text-[#C67D30] mr-3">•</span>
                <span>Right to data portability</span>
              </li>
              <li className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose flex items-start">
                <span className="text-[#C67D30] mr-3">•</span>
                <span>Right to object to processing</span>
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="py-12 lg:py-16 border-b border-[#5c4a2b]/10">
            <h2 className="text-[#C67D30] font-bold text-[24px] lg:text-[28px] mb-6">
              7. Children's Privacy
            </h2>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose">
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
              pariatur.
            </p>
          </section>

          {/* Section 8 */}
          <section className="py-12 lg:py-16 border-b border-[#5c4a2b]/10">
            <h2 className="text-[#C67D30] font-bold text-[24px] lg:text-[28px] mb-6">
              8. Changes to This Privacy Policy
            </h2>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose">
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
              officia deserunt mollit anim id est laborum. Sed ut perspiciatis
              unde omnis iste natus error sit voluptatem accusantium doloremque
              laudantium.
            </p>
          </section>

          {/* Contact Section */}
          <section className="py-12 lg:py-16">
            <h2 className="text-[#C67D30] font-bold text-[24px] lg:text-[28px] mb-6">
              Contact Us
            </h2>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose mb-6">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className="space-y-3 text-[15px] lg:text-[17px]">
              <p className="text-[#5c4a2b] leading-loose">
                <span className="font-semibold">Email:</span>{" "}
                <a
                  href="mailto:info@olivegroverestaurant.ae"
                  className="text-[#C67D30] hover:underline transition-colors"
                >
                  info@olivegroverestaurant.ae
                </a>
              </p>
              <p className="text-[#5c4a2b] leading-loose">
                <span className="font-semibold">Phone:</span>{" "}
                <a
                  href="tel:+97141234567"
                  className="text-[#C67D30] hover:underline transition-colors"
                >
                  +971-4-123-4567
                </a>
              </p>
              <p className="text-[#5c4a2b] leading-loose">
                <span className="font-semibold">Address:</span> Marina Walk,
                Building 23, Dubai, United Arab Emirates
              </p>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
