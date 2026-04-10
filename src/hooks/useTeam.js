import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'

export default function useTeam(userEmail) {
  const [team, setTeam]               = useState(null)
  const [members, setMembers]         = useState([])
  const [myMembership, setMyMember]   = useState(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')

  const fetchTeamData = useCallback(async () => {
    if (!userEmail) return
    setLoading(true); setError('')

    // 1. Est-ce que l'utilisateur est owner d'une team ?
    const { data: ownedTeam } = await supabase
      .from('teams').select('*').eq('owner_email', userEmail).maybeSingle()

    if (ownedTeam) {
      const { data: mems } = await supabase
        .from('team_members').select('*').eq('team_id', ownedTeam.id).order('joined_at')
      setTeam(ownedTeam)
      setMembers(mems || [])
      setMyMember({ role: 'owner', status: 'active' })
      setLoading(false)
      return
    }

    // 2. Est-ce que l'utilisateur est membre d'une team ?
    const { data: membership } = await supabase
      .from('team_members').select('*, teams(*)').eq('user_email', userEmail).maybeSingle()

    if (membership) {
      const { data: mems } = await supabase
        .from('team_members').select('*').eq('team_id', membership.team_id).order('joined_at')
      setTeam(membership.teams)
      setMembers(mems || [])
      setMyMember({ id: membership.id, role: membership.role, status: membership.status })
    } else {
      setTeam(null)
      setMembers([])
      setMyMember(null)
    }

    setLoading(false)
  }, [userEmail])

  useEffect(() => { fetchTeamData() }, [fetchTeamData])

  /* ── Créer une équipe ── */
  const createTeam = async (name) => {
    const { data, error: err } = await supabase
      .from('teams').insert({ name: name.trim(), owner_email: userEmail }).select().single()
    if (err) throw err
    await supabase.from('team_members').insert({
      team_id: data.id, user_email: userEmail, role: 'owner', status: 'active'
    })
    await fetchTeamData()
    return data
  }

  /* ── Inviter un membre ── */
  const inviteMember = async (email) => {
    if (!team) throw new Error('Aucune équipe créée.')
    const already = members.find(m => m.user_email === email.toLowerCase().trim())
    if (already) throw new Error('Cet email est déjà dans l\'équipe.')
    const { error: err } = await supabase.from('team_members').insert({
      team_id: team.id, user_email: email.toLowerCase().trim(), role: 'member', status: 'pending'
    })
    if (err) throw err
    await fetchTeamData()
  }

  /* ── Retirer un membre ── */
  const removeMember = async (memberId) => {
    const { error: err } = await supabase.from('team_members').delete().eq('id', memberId)
    if (err) throw err
    await fetchTeamData()
  }

  /* ── Accepter une invitation ── */
  const acceptInvite = async () => {
    if (!myMembership?.id) return
    const { error: err } = await supabase
      .from('team_members').update({ status: 'active' }).eq('id', myMembership.id)
    if (err) throw err
    await fetchTeamData()
  }

  return { team, members, myMembership, loading, error, createTeam, inviteMember, removeMember, acceptInvite, refreshTeam: fetchTeamData }
}
