import { FaFacebookF, FaGithub, FaXTwitter } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer>
      <ul aria-label="روابط التواصل">
        <li><span aria-label="فيسبوك"><FaFacebookF size={26} /></span></li>
        <li><span aria-label="جيت هب"><FaGithub size={26} /></span></li>
        <li><span aria-label="إكس"><FaXTwitter size={26} /></span></li>
      </ul>
    </footer>
  );
}
