import { MyContext } from "../../App";
import React, { useContext } from "react";
import UseAnimations from "react-useanimations";
import github from "react-useanimations/lib/github";
import Facebook from "react-useanimations/lib/facebook";
import Twitter from "react-useanimations/lib/twitter";

export default function Footer() {
  const [them] = useContext(MyContext);
  return (
    <footer>
      <ul>
        <a>
          <li>
            <UseAnimations
              autoplay={true}
              speed={0.5}
              size={35}
              loop={true}
              strokeColor={them == "dark" ? "#fff" : "000"}
              animation={Facebook}
            />
          </li>
        </a>
        <a>
          <li>
            <UseAnimations
              autoplay={true}
              speed={0.1}
              size={35}
              loop={true}
              strokeColor={them == "dark" ? "#fff" : "000"}
              animation={github}
            />
          </li>
        </a>
        <a>
          <li>
            <UseAnimations
              autoplay={true}
              speed={0.1}
              size={35}
              loop={true}
              strokeColor={them == "dark" ? "#fff" : "000"}
              animation={Twitter}
            />
          </li>
        </a>
      </ul>
    </footer>
  );
}
