import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
    return (
        <div>
            <h3>What is Ricing?</h3>
            <p>
                The term "ricing" refers to the process of customizing a Unix or Linux desktop environment to enhance its visual
                appeal and functionality. This involves modifying elements such as icons, themes, panels, and other system
                interfaces. When using a tiling window manager, ricing becomes more hands-on, requiring users to manually configure
                essential components like the panel bar, application launcher, and shortcuts to achieve a personalized setup.
            </p>
            <hr />
            <h3>The Purpose of LinuxRicer</h3>
            <p>
                At LinuxRicer, our mission is to simplify and elevate the ricing experience for Linux users. We provide a
                comprehensive directory of resources, including installation guides, configuration templates, a bundler for easy
                setups, and tools to help users achieve their dream desktop environment. Whether you're a beginner or an advanced
                user, we aim to make ricing accessible and enjoyable for everyone.
            </p>
            <hr />

            <h2>Index</h2>
            <ul>

                <li>
                    Resources - <Link to={'/resources'}>A curated list of tools and technologies to customize your system</Link>
                </li>
                <li>
                    Bundler - <Link to={'/resources'}>A curated list of tools and technologies to customize your system</Link>
                </li>
                <li>
                    Bundler - <Link to={'/resources'}>A curated list of tools and technologies to customize your system</Link>
                </li>
            </ul>
        </div>
    )
}

export default Home