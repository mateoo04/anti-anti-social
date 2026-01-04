import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Post from '../post/Post';
import { useAuth } from '../../context/authContext';
import heartFillSvg from '../../assets/icons/heart-fill.svg';
import chatSvg from '../../assets/icons/chat-fill.svg';
import peopleSvg from '../../assets/icons/nav/people-fill.svg';
import postSvg from '../../assets/icons/post-fill.svg';
import Search from '../Search';


export default function AdminPanel() {
  const [stats, setStats] = useState({});
  const { authenticatedUser } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/admin`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to fetch admin stats');

        const json = await response.json();

        setStats(json);

      } catch {
        toast.error('Failed to fetch admin stats');
      }
    };

    fetchStats();
  }, []);

 const statMeta = {
  users: { label: "Users", icon: peopleSvg },
  posts: { label: "Posts", icon: postSvg },
  comments: { label: "Comments", icon: chatSvg },
  postLikes: { label: "Post likes", icon: heartFillSvg },
  commentLikes: { label: "Comment likes", icon: heartFillSvg },

  usersCreated: { label: "Users created", icon: peopleSvg },
  usersUpdated: { label: "Users updated", icon: peopleSvg },
};

function getStatMeta(key) {
  return statMeta[key] ?? { label: key, icon: null };
}

function getStat(key, value){
    const meta = getStatMeta(key);
    return (
    <div key={key} className='admin__stat'>
      <div className='admin__stat--left'>
        {meta.icon && <img src={meta.icon} alt={`${meta.label} icon`} className='admin__stat-icon' />}
        <p className='admin__stat-name'>{meta.label}</p>
      </div>
      <div className='admin__stat--right'>
        <p className='admin__stat-value fw-bold'>{value}</p>
      </div>
    </div>)
}

  if(!authenticatedUser.isAdmin) return (<h1 className='p-4'>You do not have a permission to view this page</h1>)


  return (
    <>
      <main className='container'>
        <div className='admin__wrapper'>
            <h1>Admin Panel</h1>
            {Object.keys(stats).length > 0 && (
  <div className='admin__stats'>
    <div className='admin__stats-block border-0 rounded-5 pt-4 ps-4 pe-4 pb-3'>
    <h3>Total stats</h3>
    <div className='admin__stats-list'>
    {Object.entries(stats.totals).map(([key, value]) => getStat(key, value))}
    </div>
    </div>
    <div className='admin__stats-block border-0 rounded-5 pt-4 ps-4 pe-4 pb-3'>
    <h3>Last 30 days</h3>
    <div className='admin__stats-list'>
    {Object.entries(stats.lastNDays).map(([key, value]) => getStat(key, value))}
    </div>
    </div>
  </div>
)}
<div className="admin__search-wrapper mt-4 border-0 rounded-5 pt-4 ps-4 pe-4 pb-3">
<Search isAdminPanel={true}/>
</div>
        </div>
      </main>
    </>
  );
}
