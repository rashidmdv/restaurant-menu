"use client";

import Footer from "../components/Footer";

export default function TermsConditionsPage() {
  return (
    <main className="bg-[#fcf6e2]">
      {/* Header Section */}
      <div className="w-full bg-[#5c4a2b] py-16 lg:py-20 px-4 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-white font-bold text-[32px] md:text-[40px] lg:text-[48px] mb-4">
            Terms & Conditions
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
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
              ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
              aliquip ex ea commodo consequat.
            </p>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose">
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur. By accessing and using our
              services, you agree to be bound by these terms.
            </p>
          </section>

          {/* Section 1 */}
          <section className="py-12 lg:py-16 border-b border-[#5c4a2b]/10">
            <h2 className="text-[#C67D30] font-bold text-[24px] lg:text-[28px] mb-6">
              1. Acceptance of Terms
            </h2>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose mb-6">
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
              officia deserunt mollit anim id est laborum. Sed ut perspiciatis
              unde omnis iste natus error sit voluptatem accusantium doloremque
              laudantium.
            </p>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose">
              Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et
              quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam
              voluptatem quia voluptas sit aspernatur aut odit aut fugit.
            </p>
          </section>

          {/* Section 2 */}
          <section className="py-12 lg:py-16 border-b border-[#5c4a2b]/10">
            <h2 className="text-[#C67D30] font-bold text-[24px] lg:text-[28px] mb-6">
              2. Reservations and Cancellations
            </h2>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose mb-6">
              Sed quia consequuntur magni dolores eos qui ratione voluptatem sequi
              nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit
              amet, consectetur, adipisci velit.
            </p>

            <h3 className="text-[#5c4a2b] font-semibold text-[18px] lg:text-[20px] mb-4 mt-8">
              2.1 Making a Reservation
            </h3>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose mb-4">
              Sed quia non numquam eius modi tempora incidunt ut labore et dolore
              magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis
              nostrum exercitationem ullam corporis suscipit laboriosam.
            </p>
            <ul className="space-y-3 mb-6">
              <li className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose flex items-start">
                <span className="text-[#C67D30] mr-3">•</span>
                <span>Reservations must be made at least 24 hours in advance</span>
              </li>
              <li className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose flex items-start">
                <span className="text-[#C67D30] mr-3">•</span>
                <span>All information provided must be accurate and complete</span>
              </li>
              <li className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose flex items-start">
                <span className="text-[#C67D30] mr-3">•</span>
                <span>Confirmation will be sent via email within 24 hours</span>
              </li>
              <li className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose flex items-start">
                <span className="text-[#C67D30] mr-3">•</span>
                <span>Special requests are subject to availability</span>
              </li>
            </ul>

            <h3 className="text-[#5c4a2b] font-semibold text-[18px] lg:text-[20px] mb-4 mt-8">
              2.2 Cancellation Policy
            </h3>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose mb-6">
              Nisi ut aliquid ex ea commodi consequatur. Quis autem vel eum iure
              reprehenderit qui in ea voluptate velit esse quam nihil molestiae
              consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla
              pariatur.
            </p>

            <h3 className="text-[#5c4a2b] font-semibold text-[18px] lg:text-[20px] mb-4 mt-8">
              2.3 No-Show Policy
            </h3>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose">
              At vero eos et accusamus et iusto odio dignissimos ducimus qui
              blanditiis praesentium voluptatum deleniti atque corrupti quos
              dolores et quas molestias excepturi sint.
            </p>
          </section>

          {/* Section 3 */}
          <section className="py-12 lg:py-16 border-b border-[#5c4a2b]/10">
            <h2 className="text-[#C67D30] font-bold text-[24px] lg:text-[28px] mb-6">
              3. Payment and Pricing
            </h2>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose mb-6">
              Occaecati cupiditate non provident, similique sunt in culpa qui
              officia deserunt mollitia animi, id est laborum et dolorum fuga. Et
              harum quidem rerum facilis est et expedita distinctio.
            </p>
            <ul className="space-y-3">
              <li className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose flex items-start">
                <span className="text-[#C67D30] mr-3">•</span>
                <span>All prices are listed in UAE Dirhams (AED)</span>
              </li>
              <li className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose flex items-start">
                <span className="text-[#C67D30] mr-3">•</span>
                <span>Prices are subject to change without prior notice</span>
              </li>
              <li className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose flex items-start">
                <span className="text-[#C67D30] mr-3">•</span>
                <span>Service charges and taxes may apply</span>
              </li>
              <li className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose flex items-start">
                <span className="text-[#C67D30] mr-3">•</span>
                <span>We accept cash and major credit cards</span>
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="py-12 lg:py-16 border-b border-[#5c4a2b]/10">
            <h2 className="text-[#C67D30] font-bold text-[24px] lg:text-[28px] mb-6">
              4. Conduct and Behavior
            </h2>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose mb-6">
              Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil
              impedit quo minus id quod maxime placeat facere possimus, omnis
              voluptas assumenda est, omnis dolor repellendus.
            </p>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose mb-6">
              Temporibus autem quibusdam et aut officiis debitis aut rerum
              necessitatibus saepe eveniet ut et voluptates repudiandae sint et
              molestiae non recusandae.
            </p>
            <ul className="space-y-3">
              <li className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose flex items-start">
                <span className="text-[#C67D30] mr-3">•</span>
                <span>Appropriate dress code is required</span>
              </li>
              <li className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose flex items-start">
                <span className="text-[#C67D30] mr-3">•</span>
                <span>Respectful behavior towards staff and other guests</span>
              </li>
              <li className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose flex items-start">
                <span className="text-[#C67D30] mr-3">•</span>
                <span>Children must be supervised at all times</span>
              </li>
              <li className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose flex items-start">
                <span className="text-[#C67D30] mr-3">•</span>
                <span>We reserve the right to refuse service</span>
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="py-12 lg:py-16 border-b border-[#5c4a2b]/10">
            <h2 className="text-[#C67D30] font-bold text-[24px] lg:text-[28px] mb-6">
              5. Intellectual Property
            </h2>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose mb-6">
              Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis
              voluptatibus maiores alias consequatur aut perferendis doloribus
              asperiores repellat.
            </p>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
              ad minim veniam, quis nostrud exercitation ullamco laboris.
            </p>
          </section>

          {/* Section 6 */}
          <section className="py-12 lg:py-16 border-b border-[#5c4a2b]/10">
            <h2 className="text-[#C67D30] font-bold text-[24px] lg:text-[28px] mb-6">
              6. Limitation of Liability
            </h2>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose mb-6">
              Nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
              pariatur.
            </p>

            <h3 className="text-[#5c4a2b] font-semibold text-[18px] lg:text-[20px] mb-4 mt-8">
              6.1 Food Allergies and Dietary Restrictions
            </h3>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose mb-6">
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
              officia deserunt mollit anim id est laborum. Sed ut perspiciatis
              unde omnis iste natus error sit voluptatem.
            </p>

            <h3 className="text-[#5c4a2b] font-semibold text-[18px] lg:text-[20px] mb-4 mt-8">
              6.2 Personal Belongings
            </h3>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose">
              Accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae
              ab illo inventore veritatis et quasi architecto beatae vitae dicta
              sunt explicabo.
            </p>
          </section>

          {/* Section 7 */}
          <section className="py-12 lg:py-16 border-b border-[#5c4a2b]/10">
            <h2 className="text-[#C67D30] font-bold text-[24px] lg:text-[28px] mb-6">
              7. Privacy and Data Protection
            </h2>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose mb-6">
              Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut
              fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem
              sequi nesciunt.
            </p>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose">
              For more information on how we collect, use, and protect your
              personal data, please refer to our{" "}
              <a href="/privacy" className="text-[#C67D30] hover:underline font-semibold transition-colors">
                Privacy Policy
              </a>
              .
            </p>
          </section>

          {/* Section 8 */}
          <section className="py-12 lg:py-16 border-b border-[#5c4a2b]/10">
            <h2 className="text-[#C67D30] font-bold text-[24px] lg:text-[28px] mb-6">
              8. Governing Law
            </h2>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose mb-6">
              Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet,
              consectetur, adipisci velit, sed quia non numquam eius modi tempora
              incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
            </p>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose">
              Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis
              suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.
            </p>
          </section>

          {/* Section 9 */}
          <section className="py-12 lg:py-16 border-b border-[#5c4a2b]/10">
            <h2 className="text-[#C67D30] font-bold text-[24px] lg:text-[28px] mb-6">
              9. Changes to These Terms
            </h2>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose mb-6">
              Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse
              quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat
              quo voluptas nulla pariatur.
            </p>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose">
              At vero eos et accusamus et iusto odio dignissimos ducimus qui
              blanditiis praesentium voluptatum deleniti atque corrupti quos
              dolores et quas molestias excepturi sint occaecati cupiditate non
              provident.
            </p>
          </section>

          {/* Contact Section */}
          <section className="py-12 lg:py-16">
            <h2 className="text-[#C67D30] font-bold text-[24px] lg:text-[28px] mb-6">
              Contact Information
            </h2>
            <p className="text-[#5c4a2b] text-[15px] lg:text-[17px] leading-loose mb-6">
              If you have any questions about these Terms & Conditions, please
              contact us:
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
                  href="tel:+97142364555"
                  className="text-[#C67D30] hover:underline transition-colors"
                >
                  +971 04 236 4555
                </a>
              </p>
              <p className="text-[#5c4a2b] leading-loose">
                <span className="font-semibold">Address:</span> Jordanian Social Club - Oud Metha - Dubai
              </p>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
