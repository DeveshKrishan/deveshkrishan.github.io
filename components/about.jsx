import styles from "./Intro.module.css"

export default function About() {
    return (
        <div className={styles.about}>
            <h2 className={styles.big} id={styles.about_title} style={{padding: "1rem 0"}}>Learn who I am! 🤔</h2>
            <div className={styles.about_section}>
                <img src="https://i.postimg.cc/F1tQ7VLd/image.png" alt="Picture of Devesh Krishan" id={styles.about_pic}/>
                <div id={styles.about_desc} style={{paddingLeft: "4rem"}}>
                    <p className={styles.p} >Hi I’m Devesh! I’m currently studying Computer Science at the University of California, Irvine. </p>
                    <p className={styles.p}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras felis lectus, tristique ac ante eget, luctus eleifend risus. Nunc at bibendum sapien. Praesent consectetur, eros in condimentum sollicitudin, lectus purus laoreet orci, vel pellentesque lorem justo ut magna. Mauris efficitur erat eget velit faucibus mollis quis in lacus. Nullam non feugiat justo, sed pharetra leo. Vestibulum vitae turpis in est elementum convallis non id risus.  .</p>
                    <p className={styles.p}>Some of my free time is spent playing video games with friends, watching movies, and sleeping! </p>
                </div>
            </div>
        </div>
    )
}