import './lp/lp.css'

export const metadata = {
    title: 'Tabacaria Strong – Onde os Campeões se Encontram',
    description: 'Torneios semanais de sinuca. Premiações mensais. Ranking anual. A experiência definitiva de competição na Tabacaria Strong.',
}

export default function LandingPage() {
    return (
        <div className="lp">
            {/* ===== HERO SECTION ===== */}
            <section className="lp-hero">
                <div className="lp-hero__particles" aria-hidden="true">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <span key={i} className="lp-particle" style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 6}s`,
                            animationDuration: `${4 + Math.random() * 4}s`,
                        }} />
                    ))}
                </div>
                <div className="lp-hero__glow" />
                <div className="lp-hero__content">
                    <div className="lp-hero__logo-wrap">
                        <img src="/logo-strong.png" alt="Tabacaria Strong" className="lp-hero__logo" />
                    </div>
                    <h1 className="lp-hero__headline">Onde os Campeões se Encontram.</h1>
                    <p className="lp-hero__sub">
                        Torneios semanais. Premiações mensais. Ranking anual.<br />
                        A experiência definitiva de competição na <strong>Tabacaria Strong</strong>.
                    </p>
                    <div className="lp-hero__ctas">
                        <a href="/ranking" className="lp-btn lp-btn--solid">Ver Ranking</a>
                        <a href="/dashboard" className="lp-btn lp-btn--outline">Login Admin</a>
                    </div>
                </div>
                <div className="lp-hero__scroll-hint">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
                </div>
            </section>

            {/* ===== SEÇÃO 1 – TORNEIOS SEMANAIS ===== */}
            <section className="lp-section lp-section--torneios" id="torneios">
                <div className="lp-container lp-two-col">
                    <div className="lp-two-col__visual lp-reveal">
                        <div className="lp-table-visual">
                            <div className="lp-table-visual__felt" />
                            <div className="lp-table-visual__light" />
                            <div className="lp-table-visual__ball lp-table-visual__ball--1" />
                            <div className="lp-table-visual__ball lp-table-visual__ball--2" />
                            <div className="lp-table-visual__ball lp-table-visual__ball--3" />
                            <div className="lp-table-visual__cue" />
                        </div>
                    </div>
                    <div className="lp-two-col__text lp-reveal">
                        <h2 className="lp-title">Torneios Semanais<br /><span className="lp-title--gold">Exclusivos</span></h2>
                        <p className="lp-text">
                            Toda semana a Strong reúne os melhores jogadores em disputas intensas, organizadas, justas e emocionantes.
                        </p>
                        <ul className="lp-checklist">
                            <li>Ambiente organizado</li>
                            <li>Confrontos definidos por sistema justo</li>
                            <li>Ranking atualizado automaticamente</li>
                            <li>Experiência profissional</li>
                        </ul>
                        <div className="lp-highlight">
                            <span className="lp-highlight__icon">🏆</span>
                            Premiação imediata ao campeão da semana.
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== SEÇÃO 2 – PREMIAÇÕES MENSAIS ===== */}
            <section className="lp-section lp-section--mensais" id="mensais">
                <div className="lp-container">
                    <h2 className="lp-title lp-title--center lp-reveal">
                        A Cada Mês, Um Novo<br /><span className="lp-title--gold">Campeão da Elite</span>
                    </h2>
                    <p className="lp-text lp-text--center lp-reveal">
                        Os pontos acumulados durante os torneios semanais formam o Ranking Mensal.
                        Os melhores colocados recebem premiações especiais e reconhecimento público.
                    </p>
                    <div className="lp-podium lp-reveal">
                        <div className="lp-podium__item lp-podium__item--2">
                            <div className="lp-podium__medal">🥈</div>
                            <div className="lp-podium__place">2º Lugar</div>
                            <div className="lp-podium__desc">Prêmio Exclusivo</div>
                            <div className="lp-podium__bar" />
                        </div>
                        <div className="lp-podium__item lp-podium__item--1">
                            <div className="lp-podium__crown">👑</div>
                            <div className="lp-podium__medal">🥇</div>
                            <div className="lp-podium__place">1º Lugar</div>
                            <div className="lp-podium__desc">Troféu + Premiação Especial</div>
                            <div className="lp-podium__bar" />
                        </div>
                        <div className="lp-podium__item lp-podium__item--3">
                            <div className="lp-podium__medal">🥉</div>
                            <div className="lp-podium__place">3º Lugar</div>
                            <div className="lp-podium__desc">Destaque Oficial</div>
                            <div className="lp-podium__bar" />
                        </div>
                    </div>
                    <p className="lp-quote lp-reveal">Aqui, consistência vale ouro.</p>
                </div>
            </section>

            {/* ===== SEÇÃO 3 – PREMIAÇÃO ANUAL ===== */}
            <section className="lp-section lp-section--anual" id="anual">
                <div className="lp-container">
                    <h2 className="lp-title lp-title--center lp-title--big lp-reveal">
                        O Grande Campeão<br /><span className="lp-title--gold">do Ano</span>
                    </h2>
                    <p className="lp-text lp-text--center lp-reveal">
                        Durante todo o ano, os jogadores acumulam pontos no ranking geral.
                        Apenas os mais dedicados chegam ao topo.
                    </p>
                    <div className="lp-hall lp-reveal">
                        <div className="lp-hall__frame">
                            <div className="lp-hall__glow" />
                            <div className="lp-hall__icon">👑</div>
                            <div className="lp-hall__label">Hall da Fama</div>
                            <div className="lp-hall__name">Campeão 2025</div>
                            <div className="lp-hall__points">
                                <span className="lp-hall__counter">???</span>
                                <span className="lp-hall__pts-label">pontos</span>
                            </div>
                        </div>
                    </div>
                    <p className="lp-legacy lp-reveal">
                        Mais que um torneio.<br />
                        <strong>Um legado.</strong>
                    </p>
                </div>
            </section>

            {/* ===== SEÇÃO 4 – BENEFÍCIOS ===== */}
            <section className="lp-section lp-section--beneficios" id="beneficios">
                <div className="lp-container">
                    <h2 className="lp-title lp-title--center lp-reveal">
                        Por Que <span className="lp-title--gold">Participar?</span>
                    </h2>
                    <div className="lp-grid lp-reveal">
                        <div className="lp-card">
                            <div className="lp-card__icon">🎯</div>
                            <h3 className="lp-card__title">Competição de Verdade</h3>
                            <p className="lp-card__text">Sistema justo, transparente e organizado.</p>
                        </div>
                        <div className="lp-card">
                            <div className="lp-card__icon">🏆</div>
                            <h3 className="lp-card__title">Reconhecimento</h3>
                            <p className="lp-card__text">Seu nome eternizado no ranking da Strong.</p>
                        </div>
                        <div className="lp-card">
                            <div className="lp-card__icon">💰</div>
                            <h3 className="lp-card__title">Premiações Reais</h3>
                            <p className="lp-card__text">Ganhe semanalmente, mensalmente e anualmente.</p>
                        </div>
                        <div className="lp-card">
                            <div className="lp-card__icon">👥</div>
                            <h3 className="lp-card__title">Networking</h3>
                            <p className="lp-card__text">Conecte-se com jogadores de alto nível.</p>
                        </div>
                        <div className="lp-card">
                            <div className="lp-card__icon">📈</div>
                            <h3 className="lp-card__title">Evolução Constante</h3>
                            <p className="lp-card__text">Acompanhe seu desempenho e melhore a cada etapa.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== SEÇÃO 5 – RANKING AO VIVO ===== */}
            <section className="lp-section lp-section--ranking" id="ranking">
                <div className="lp-container">
                    <h2 className="lp-title lp-title--center lp-reveal">
                        Ranking <span className="lp-title--gold">Ao Vivo</span>
                    </h2>
                    <p className="lp-text lp-text--center lp-reveal">
                        Veja sua posição em tempo real.<br />
                        Suba no ranking. Construa sua história.
                    </p>
                    <div className="lp-ranking-mock lp-reveal">
                        <div className="lp-ranking-mock__header">
                            <span>Posição</span><span>Jogador</span><span>Pontos</span>
                        </div>
                        {[
                            { pos: 1, name: '???', pts: '---', cls: 'gold' },
                            { pos: 2, name: '???', pts: '---', cls: 'silver' },
                            { pos: 3, name: '???', pts: '---', cls: 'bronze' },
                            { pos: 4, name: '???', pts: '---', cls: '' },
                            { pos: 5, name: '???', pts: '---', cls: '' },
                        ].map(r => (
                            <div key={r.pos} className={`lp-ranking-mock__row ${r.cls ? `lp-ranking-mock__row--${r.cls}` : ''}`}>
                                <span className="lp-ranking-mock__pos">{r.pos}º</span>
                                <span className="lp-ranking-mock__name">{r.name}</span>
                                <span className="lp-ranking-mock__pts">{r.pts}</span>
                            </div>
                        ))}
                    </div>
                    <div className="lp-center lp-reveal">
                        <a href="/ranking" className="lp-btn lp-btn--outline lp-btn--lg">Ver Ranking Completo</a>
                    </div>
                </div>
            </section>

            {/* ===== CTA FINAL ===== */}
            <section className="lp-section lp-section--cta" id="cta">
                <div className="lp-container">
                    <h2 className="lp-cta__headline lp-reveal">
                        Acompanhe a <span className="lp-title--gold">elite</span> da sinuca.
                    </h2>
                    <div className="lp-center lp-reveal">
                        <a href="/ranking" className="lp-btn lp-btn--solid lp-btn--xl">Ver Ranking Oficial</a>
                    </div>
                </div>
            </section>

            {/* Scroll animation script */}
            <ScrollAnimator />
        </div>
    )
}

function ScrollAnimator() {
    return (
        <script
            dangerouslySetInnerHTML={{
                __html: `
                    (function(){
                        const observer = new IntersectionObserver((entries) => {
                            entries.forEach(entry => {
                                if (entry.isIntersecting) {
                                    entry.target.classList.add('lp-visible');
                                }
                            });
                        }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
                        document.querySelectorAll('.lp-reveal').forEach(el => observer.observe(el));
                    })();
                `,
            }}
        />
    )
}
